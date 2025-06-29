const { TokenType } = require("./lexer");

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
    this.equChecked = false; // 标记是否已检查 equ 语句
  }

  eat(type) {
    if (this.currentToken.type === type) this.currentToken = this.lexer.nextToken();
    else throw new Error(`预期 ${type}，但得到 ${this.currentToken.type}`);
  }

  // 解析程序（首行必须是 equ 语句）
  parseProgram() {
    const program = { type: "Program", body: [], device: null };
    
    // 检查首行是否为 equ 语句
    if (this.currentToken.type === TokenType.EQU) {
      const equStmt = this.parseEquStatement();
      program.body.push(equStmt);
      program.device = equStmt.device;
      this.equChecked = true;
    } else {
      throw new Error("首行必须是 equ 语句（如 equ PC）");
    }

    // 解析剩余语句
    while (this.currentToken.type !== TokenType.EOF) {
      program.body.push(this.parseStatement());
    }
    return program;
  }

  // 解析 equ 语句（如 equ Phone）
  parseEquStatement() {
    this.eat(TokenType.EQU);
    const device = this.currentToken.value;
    this.eat(TokenType.DEVICE);
    this.eat(TokenType.SEMICOLON); // 语句结束符
    return { type: "EquStatement", device };
  }

  // 解析输出语句（如 output("Hello");）
  parseOutputStatement() {
    this.eat(TokenType.IDENTIFIER); // 消耗 output
    this.eat(TokenType.LPAREN);
    const value = this.currentToken.type === TokenType.STRING 
      ? this.currentToken.value 
      : this.currentToken.value; // 支持变量
    this.eat(TokenType.STRING);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: "OutputStatement", value };
  }

  // 解析输入语句（如 input("请输入：");）
  parseInputStatement() {
    this.eat(TokenType.IDENTIFIER); // 消耗 input
    this.eat(TokenType.LPAREN);
    const prompt = this.currentToken.value;
    this.eat(TokenType.STRING);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: "InputStatement", prompt };
  }

  // 解析获取输入内容（如 obinput();）
  parseObinputStatement() {
    this.eat(TokenType.IDENTIFIER); // 消耗 obinput
    this.eat(TokenType.LPAREN);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: "ObinputStatement" };
  }

  // 解析变量赋值（如 let name = obinput();）
  parseVariableDeclaration() {
    // 简化实现：假设变量声明格式为 let 变量名 = 表达式;
    this.eat(TokenType.IDENTIFIER); // 消耗 let（需在 lexer 中添加识别）
    const name = this.currentToken.value;
    this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.EQU); // 这里复用 EQU 类型表示 =
    const value = this.parseStatement(); // 这里简化为直接获取 obinput 结果
    return { type: "VariableDeclaration", name, value };
  }

  parseStatement() {
    switch (this.currentToken.value) {
      case "output": return this.parseOutputStatement();
      case "input": return this.parseInputStatement();
      case "obinput": return this.parseObinputStatement();
      case "let": return this.parseVariableDeclaration();
      default: throw new Error(`未知语句: ${this.currentToken.value}`);
    }
  }
}

module.exports = { Parser };
