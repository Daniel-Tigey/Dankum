const TokenType = {
  EQU: "EQU",         // equ 关键字
  DEVICE: "DEVICE",   // 设备类型（Phone/PC/Pad）
  IDENTIFIER: "IDENTIFIER", // 变量名
  STRING: "STRING",   // 字符串（如 "Hello"）
  LPAREN: "LPAREN",   // (
  RPAREN: "RPAREN",   // )
  SEMICOLON: "SEMICOLON", // ;
  EOF: "EOF"          // 结束标记
};

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.currentChar = input[this.pos];
  }

  advance() { this.pos++; this.currentChar = this.input[this.pos] || null; }
  skipWhitespace() { while (this.currentChar?.match(/\s/)) this.advance(); }

  parseString() {
    let str = "";
    this.advance(); // 跳过开头的 "
    while (this.currentChar && this.currentChar !== '"') {
      str += this.currentChar;
      this.advance();
    }
    this.advance(); // 跳过结尾的 "
    return { type: TokenType.STRING, value: str };
  }

  parseIdentifier() {
    let id = "";
    while (this.currentChar?.match(/[a-zA-Z_]/)) {
      id += this.currentChar;
      this.advance();
    }
    // 识别设备类型
    if (["Phone", "PC", "Pad"].includes(id)) {
      return { type: TokenType.DEVICE, value: id };
    }
    return { type: TokenType.IDENTIFIER, value: id };
  }

  nextToken() {
    while (this.currentChar) {
      if (this.currentChar.match(/\s/)) { this.skipWhitespace(); continue; }
      if (this.currentChar === '"') return this.parseString();
      if (this.currentChar === '(') { this.advance(); return { type: TokenType.LPAREN }; }
      if (this.currentChar === ')') { this.advance(); return { type: TokenType.RPAREN }; }
      if (this.currentChar === ';') { this.advance(); return { type: TokenType.SEMICOLON }; }
      if (this.currentChar.match(/[a-zA-Z_]/)) {
        const id = this.parseIdentifier();
        // 识别 equ 关键字
        if (id.value === "equ") return { type: TokenType.EQU };
        // 识别 output/input/obinput
        if (["output", "input", "obinput"].includes(id.value)) {
          return { type: TokenType.IDENTIFIER, value: id.value };
        }
        return id;
      }
      throw new Error(`未知字符: ${this.currentChar}`);
    }
    return { type: TokenType.EOF };
  }
}

module.exports = { Lexer, TokenType };
