import {GlobalsCompiler, SourceModifier} from 'es6-module-transpiler';
import { dirname, resolve } from 'path';

class LocalsCompiler extends GlobalsCompiler {
  constructor(...args) {
    super(...args);

    this.options.imports = this.options.imports || {};
  }

  stringify() {
    if (!this.moduleName) {
      throw new Error('moduleName must be defiend for locals compiler');
    }

    this.hasDefaultExport = this.exports.reduce(function(acc, item) {
      return acc || item.default;
    }, false);

    var string = this.string.toString();  // string is actually a node buffer
    this.source = new SourceModifier(string);

    this.map = [];
    var out = this.buildPreamble(this.exports.length > 0);

    this.buildImports();
    this.buildExports();

    out += this.indentLines();
    if (this.exports.length > 0) {
      out += "\n  return __exports__;";
    }
    out += "\n})";
    out += this.buildSuffix();
    out += ";\n";

    return out;
  }

  buildPreamble() {
    var out = "",
        dependencyNames = this.dependencyNames;

    if (this.exports.length > 0) {
      out += `var ${this.options.imports[this.moduleName] || this.moduleName} = `;
    }

    out += "(function(";

    for (var idx = 0; idx < dependencyNames.length; idx++) {
      out += `__dependency${idx+1}__`;
      this.map[dependencyNames[idx]] = idx+1;
      if (!(idx === dependencyNames.length - 1)) out += ", ";
    }

    out += ") {\n";

    out += '  "use strict";\n';

    if (this.exports.length > 0) {
      out += "  var __exports__";
      if (!this.hasDefaultExport) {
        out += " = {}";
      }
      out += ";\n";
    }

    return out;
  }

  buildSuffix() {
    var dependencyNames = this.dependencyNames;
    var out = "(";

    for (var idx = 0; idx < dependencyNames.length; idx++) {
      var name = dependencyNames[idx];
      name = this.resolveModuleName(name);

      out += this.options.imports[name] || name;
      if (!(idx === dependencyNames.length - 1)) out += ", ";
    }

    out += ")";
    return out;
  }

  doModuleImport(name, dependencyName, idx) {
    return `var ${name} = __dependency${this.map[dependencyName]}__;\n`;
  }

  doDefaultImport(name, dependencyName, idx) {
    return `var ${name} = __dependency${this.map[dependencyName]}__;\n`;
  }

  doNamedImport(name, dependencyName, alias) {
    return `var ${alias} = __dependency${this.map[dependencyName]}__.${name};\n`;
  }

  doDefaultExport(identifier) {
    return `__exports__ = `;
  }

  resolveModuleName(name) {
    if (/^\.{1,2}\//.test(name)) {
      name = resolve(dirname(this.moduleName), name);
      name = name.replace(/\.js$/, '') + '.js';
    }
    return name;
  }
}

export default LocalsCompiler;
