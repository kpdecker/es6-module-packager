module _ from 'underscore';
module fs from 'fs';
module Path from 'path';
import { Compiler } from 'es6-module-transpiler';
import LocalsCompiler from './locals-compiler';

class Packager {
  constructor(file, options = {}) {
    this.requestedName = file;
    this.file = Path.resolve(file);

    this.loadedModules = {};
    this.fileList = [];

    this.options = options;
    this.options.imports = {};
    this.unique = 0;

    this.collectDependencies();
  }

  collectDependencies(file = this.file, requested = this.requestedName, parent = this.file) {
    file = file.replace(/\.js$/, '') + '.js';

    this.loadedModules[file] = false;
    this.options.imports[file] = `__module${this.unique++}__`;

    var source,
        compiler;

    try {
      source = fs.readFileSync(file);
    } catch (err) {
      throw new Error(`Unable to lookup "${requested}" from "${parent}"`);
    }
    compiler = new Compiler(source, file, this.options);

    compiler.imports.forEach(function(importStatement) {
      var name = importStatement.source.value,
          path = Path.resolve(Path.dirname(file), name);
      path = path.replace(/\.js$/, '') + '.js';

      if (this.loadedModules[path] === false) {
        throw new Error(`Circular dependency found "${importStatement.source.value}" in "${file}"`);
      } else if (!this.loadedModules[path]) {
        this.collectDependencies(path, name, file);
        this.checkImports(path, importStatement);
      }
    }, this);

    this.loadedModules[file] = compiler;
    this.fileList.push(file);

    return this.fileList;
  }

  toLocals() {
    var modules = this.loadedModules,
        options = this.options,
        root = Path.dirname(this.file);

    var out = this.options['export'] ? `/* exported ${this.options['export']} */\nthis.${this.options['export']} = this.${this.options['export']} || ` : '';
    out += '(function() {\n';
    out += this.fileList.map(function(file) {
      var compiler = modules[file];
      return `// ${Path.relative(root, file)}\n${new LocalsCompiler(compiler, options).stringify()}`;
    }).join('\n');

    if (this.options['export']) {
      out += '\n  return __module0__;';
    }
    out += '\n})();\n';
    return out;
  }

  checkImports(name, importStatement) {
    var imported = this.loadedModules[name],
        exports = imported.exports;

    if (importStatement.kind === 'default') {
      if (!_.any(exports, function(export_) { return export_['default']; })) {
        throw new Error(`No default export for "${name}"`);
      }
    } else if (importStatement.kind === 'named') {
      _.each(importStatement.specifiers, function(specifier) {
        var specifierName = specifier.id.name;

        var exported = _.any(exports, function(export_) {
          if (export_.specifiers) {
            return _.any(export_.specifiers, function(exportSpecifier) {
              return exportSpecifier.id.name === specifierName;
            });
          } else if (export_.declaration) {
            if (export_.declaration.type === 'VariableDeclaration') {
              return export_.declaration.declarations[0].id.name === specifierName;
            } else if (export_.declaration.type === 'FunctionDeclaration') {
              return export_.declaration.id.name === specifierName;
            } else if (export_.declaration.type === 'Indentifier') {
              return export_.declaration.name === specifierName;
            }
          }
        });
        if (!exported) {
          throw new Error(`No export named "${specifierName}" in "${name}"`);
        }
      });
    }
  }
}

export default Packager;
