const readline = require("readline-sync"); // 用于命令行输入
const { getDeviceSpeed } = require("./device");

class Environment {
  constructor() {
    this.variables = {}; // 存储变量
    this.lastInput = "0"; // 存储 input() 的输入内容，默认 "0"
  }
}

class Interpreter {
  constructor() {
    this.env = new Environment();
  }

  // 根据设备类型延迟执行（模拟速度差异）
  async delayByDevice(device) {
    const delay = getDeviceSpeed(device); // 获取延迟时间（ms）
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async visit(node, device) {
    switch (node.type) {
      case "Program":
        await this.visitProgram(node);
        break;
      case "EquStatement":
        // 设备类型已在 AST 中记录，无需额外处理
        break;
      case "OutputStatement":
        await this.visitOutputStatement(node, device);
        break;
      case "InputStatement":
        await this.visitInputStatement(node, device);
        break;
      case "ObinputStatement":
        return await this.visitObinputStatement(node, device);
      case "VariableDeclaration":
        await this.visitVariableDeclaration(node, device);
        break;
    }
  }

  async visitProgram(program) {
    for (const stmt of program.body) {
      await this.visit(stmt, program.device);
    }
  }

  async visitOutputStatement(stmt, device) {
    await this.delayByDevice(device); // 模拟设备速度
    console.log(stmt.value); // 控制台输出
  }

  async visitInputStatement(stmt, device) {
    await this.delayByDevice(device);
    // 弹出输入框（命令行中用 readline 模拟）
    this.env.lastInput = readline.question(stmt.prompt + " ");
  }

  async visitObinputStatement(stmt, device) {
    await this.delayByDevice(device);
    return this.env.lastInput || "0"; // 未输入则返回 "0"
  }

  async visitVariableDeclaration(stmt, device) {
    const value = await this.visit(stmt.value, device);
    this.env.variables[stmt.name] = value;
  }
}

module.exports = { Interpreter };
