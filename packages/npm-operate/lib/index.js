"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.existsCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const constants_1 = require("./constants");
const existsCommand = (command) => {
    let test = false;
    try {
        execa_1.default.commandSync(command, { encoding: 'utf8' });
        test = true;
    }
    catch (error) { }
    return test;
};
exports.existsCommand = existsCommand;
/**
 * npm 操作类
 */
class NpmOperate {
    constructor(parameters = {}) {
        this.options = {};
        this.packageManageTool = constants_1.PACKAGE_MANAGE_TOOL.yarn;
        this.isLernaProject = false;
        this.packages = {};
        const { rootPath = process.cwd(), configPath = 'package.json', getEarsPackageManageTool } = parameters;
        this.options.rootPath = rootPath;
        this.options.configPath = configPath;
        if (!fs_1.default.existsSync(path_1.default.join(rootPath, configPath)))
            throw new Error('未检测到 NPM 配置！');
        this.packageManageTool = fs_1.default.existsSync(`${rootPath}/package-lock.json`)
            ? constants_1.PACKAGE_MANAGE_TOOL.npm
            : fs_1.default.existsSync(`${rootPath}/yarn.lock`)
                ? constants_1.PACKAGE_MANAGE_TOOL.yarn
                : undefined;
        if (!this.packageManageTool && getEarsPackageManageTool)
            this.packageManageTool = getEarsPackageManageTool(constants_1.PACKAGE_MANAGE_TOOL);
        this.isLernaProject = fs_1.default.existsSync(`${rootPath}/lerna.json`);
        if (this.isLernaProject) {
            const files = fs_1.default.readdirSync(path_1.default.join(rootPath, 'packages'));
            for (const fileName of files) {
                const config = this.readConfig(path_1.default.join(rootPath, 'packages', fileName, 'package.json'));
                this.packages[config.name] = fileName;
            }
        }
    }
    get rootConfigPath() {
        return path_1.default.join(this.options.rootPath, this.options.configPath);
    }
    getInstallCommand(packageName, isDev = false) {
        if (this.packageManageTool === constants_1.PACKAGE_MANAGE_TOOL.yarn) {
            if (this.isLernaProject)
                return `yarn add ${packageName} -W${isDev ? 'D' : ''}`;
            return `yarn add ${packageName}${isDev ? ' -D' : ''}`;
        }
        return `npm install ${packageName}${isDev ? ' -D' : ''}`;
    }
    getUninstallCommand(packageName) {
        if (this.packageManageTool === constants_1.PACKAGE_MANAGE_TOOL.yarn) {
            if (this.isLernaProject)
                return `yarn remove ${packageName} -WD`;
            return `yarn remove ${packageName}`;
        }
        return `npm uninstall ${packageName}`;
    }
    /**
     * 读配置
     */
    readConfig(configPath = this.rootConfigPath) {
        const text = fs_1.default.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(text);
        return config;
    }
    /**
     * 读子包配置
     * @param packageName 子包名
     */
    readConfigLerna(packageName) {
        return this.readConfig(path_1.default.join(this.options.rootPath, 'packages', this.packages[packageName]));
    }
    /**
     * 读所有子包配置
     */
    readConfigLernaAll() {
        const configAll = {};
        for (const packageName of Object.keys(this.packages)) {
            configAll[packageName] = this.readConfigLerna(packageName);
        }
        return configAll;
    }
    /**
     * 写配置
     * @param config 待写入配置
     */
    writeConfig(config) {
        fs_1.default.writeFileSync(this.rootConfigPath, JSON.stringify(config, null, 2), 'utf8');
    }
    /**
     * 安装生产依赖
     * @param dependencies 待安装依赖
     */
    install(dependencies) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        for (const dependency of dependencies) {
            execa_1.default.commandSync(this.getInstallCommand(dependency, false), { stdio: 'inherit' });
        }
    }
    /**
     * 安装开发依赖
     * @param dependencies 待安装依赖
     */
    installDev(dependencies) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        for (const dependency of dependencies) {
            execa_1.default.commandSync(this.getInstallCommand(dependency, true), { stdio: 'inherit' });
        }
    }
    /**
     * 卸载依赖
     * @param dependencies 待卸载依赖
     */
    uninstall(dependencies) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        const npmConfigText = fs_1.default.readFileSync(this.rootConfigPath, 'utf-8');
        const npmConfig = JSON.parse(npmConfigText);
        let allDependencies = [];
        if (npmConfig.hasOwnProperty('dependencies')) {
            allDependencies = allDependencies.concat(Object.keys(npmConfig.dependencies));
        }
        if (npmConfig.hasOwnProperty('devDependencies')) {
            allDependencies = allDependencies.concat(Object.keys(npmConfig.devDependencies));
        }
        for (const dependency of dependencies) {
            if (!allDependencies.includes(dependency))
                continue;
            execa_1.default.commandSync(this.getUninstallCommand(dependency), { stdio: 'inherit' });
        }
    }
    /**
     * 安装子包生产依赖
     * @param dependencies 待安装依赖
     * @param packages 需要安装依赖的子包
     */
    installLerna(dependencies, packages = Object.keys(this.packages)) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        if (!Array.isArray(packages))
            packages = [packages];
        for (const dependency of dependencies) {
            for (const packageName of packages) {
                execa_1.default.commandSync(`lerna add ${dependency} --scope=${packageName}`, { stdio: 'inherit' });
            }
        }
    }
    /**
     * 安装子包开发依赖
     * @param dependencies 待安装依赖
     * @param packages 需要安装依赖的子包
     */
    installDevLerna(dependencies, packages = Object.keys(this.packages)) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        if (!Array.isArray(packages))
            packages = [packages];
        for (const dependency of dependencies) {
            for (const packageName of packages) {
                execa_1.default.commandSync(`lerna add ${dependency} --scope=${packageName} -D`, { stdio: 'inherit' });
            }
        }
    }
    /**
     * 卸载子包依赖
     * @param dependencies 待卸载依赖
     * @param packages 需要安装依赖的子包
     */
    uninstallLerna(dependencies, packages = Object.keys(this.packages)) {
        if (!Array.isArray(dependencies))
            dependencies = [dependencies];
        if (!Array.isArray(packages))
            packages = [packages];
        for (const packageName of packages) {
            const npmConfig = this.readConfigLerna(packageName);
            let allDependencies = [];
            if (npmConfig.hasOwnProperty('dependencies')) {
                allDependencies = allDependencies.concat(Object.keys(npmConfig.dependencies));
            }
            if (npmConfig.hasOwnProperty('devDependencies')) {
                allDependencies = allDependencies.concat(Object.keys(npmConfig.devDependencies));
            }
            for (const dependency of dependencies) {
                if (!allDependencies.includes(dependency))
                    continue;
                execa_1.default.commandSync(this.getUninstallCommand(dependency), { stdio: 'inherit' });
            }
        }
    }
}
exports.default = NpmOperate;
