const TokenType = {
  // 关键字
  EQU: "EQU",
  OUTPUT: "OUTPUT",
  INPUT: "INPUT",
  OBINPUT: "OBINPUT",
  TURN: "TURN",
  TURNTO: "TURNTO",
  IF: "IF",
  ELSEIF: "ELSEIF",
  ELSE: "ELSE",
  ONE_STEP: "ONE_STEP",
  STOP: "STOP",
  BREAK: "BREAK",
  GB: "GB",
  CLOUD: "CLOUD",
  CUSTOM: "CUSTOM",
  RETURN: "RETURN",
  DISPLAY: "DISPLAY",
  HIDE: "HIDE",
  SETWINDOW: "SETWINDOW",
  DRAW: "DRAW",
  WINDOW: "WINDOW",
  MUSIC: "MUSIC",
  
  // 数据类型
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  IDENTIFIER: "IDENTIFIER",
  LIST: "LIST",
  
  // 运算符
  PLUS: "PLUS",
  MINUS: "MINUS",
  MULTIPLY: "MULTIPLY",
  DIVIDE: "DIVIDE",
  POWER: "POWER",
  FLOOR_DIVIDE: "FLOOR_DIVIDE",
  MODULO: "MODULO",
  EQUAL: "EQUAL",
  NOT_EQUAL: "NOT_EQUAL",
  GREATER: "GREATER",
  LESS: "LESS",
  GREATER_EQUAL: "GREATER_EQUAL",
  LESS_EQUAL: "LESS_EQUAL",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  IN: "IN",
  
  // 标点符号
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  LBRACKET: "LBRACKET",
  RBRACKET: "RBRACKET",
  COMMA: "COMMA",
  SEMICOLON: "SEMICOLON",
  COLON: "COLON",
  DOT: "DOT",
  
  // 特殊符号
  NEWLINE: "NEWLINE",
  EOF: "EOF"
};

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[this.position];
    this.line = 1;
    this.column = 1;
  }

  advance() {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    
    this.position++;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  skipWhitespace() {
    while (this.currentChar && (this.currentChar === ' ' || this.currentChar === '\t')) {
      this.advance();
    }
  }

  skipComment() {
    if (this.currentChar === '#') {
      while (this.currentChar && this.currentChar !== '\n' && this.currentChar !== ';') {
        this.advance();
      }
    }
  }

  number() {
    let result = '';
    while (this.currentChar && /[0-9.]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    if (result.includes('.')) {
      return parseFloat(result);
    } else {
      return parseInt(result, 10);
    }
  }

  string() {
    this.advance(); // 跳过开始的引号
    let result = '';
    while (this.currentChar && this.currentChar !== '"') {
      result += this.currentChar;
      this.advance();
    }
    this.advance(); // 跳过结束的引号
    return result;
  }

  identifier() {
    let result = '';
    while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    // 检查是否为关键字
    switch (result) {
      case 'equ': return { type: TokenType.EQU, value: result };
      case 'output': return { type: TokenType.OUTPUT, value: result };
      case 'input': return { type: TokenType.INPUT, value: result };
      case 'obinput': return { type: TokenType.OBINPUT, value: result };
      case 'turn': return { type: TokenType.TURN, value: result };
      case 'turnto': return { type: TokenType.TURNTO, value: result };
      case 'if': return { type: TokenType.IF, value: result };
      case 'elseif': return { type: TokenType.ELSEIF, value: result };
      case 'else': return { type: TokenType.ELSE, value: result };
      case 'one_step': return { type: TokenType.ONE_STEP, value: result };
      case 'stop': return { type: TokenType.STOP, value: result };
      case 'break': return { type: TokenType.BREAK, value: result };
      case 'gb': return { type: TokenType.GB, value: result };
      case 'cloud': return { type: TokenType.CLOUD, value: result };
      case 'custom': return { type: TokenType.CUSTOM, value: result };
      case 'return': return { type: TokenType.RETURN, value: result };
      case 'display': return { type: TokenType.DISPLAY, value: result };
      case 'hide': return { type: TokenType.HIDE, value: result };
      case 'setwindow': return { type: TokenType.SETWINDOW, value: result };
      case 'draw': return { type: TokenType.DRAW, value: result };
      case 'window': return { type: TokenType.WINDOW, value: result };
      case 'music': return { type: TokenType.MUSIC, value: result };
      case 'true': return { type: TokenType.BOOLEAN, value: true };
      case 'false': return { type: TokenType.BOOLEAN, value: false };
      default: return { type: TokenType.IDENTIFIER, value: result };
    }
  }

  list() {
    this.advance(); // 跳过左括号
    let elements = [];
    this.skipWhitespace();
    
    while (this.currentChar && this.currentChar !== ']') {
      const token = this.getNextToken();
      elements.push(token);
      this.skipWhitespace();
      
      if (this.currentChar === ',') {
        this.advance();
        this.skipWhitespace();
      }
    }
    
    this.advance(); // 跳过右括号
    return { type: TokenType.LIST, value: elements };
  }

  getNextToken() {
    while (this.currentChar) {
      if (this.currentChar === ' ' || this.currentChar === '\t') {
        this.skipWhitespace();
        continue;
      }
      
      if (this.currentChar === '\n') {
        this.advance();
        return { type: TokenType.NEWLINE, value: '\n' };
      }
      
      if (this.currentChar === '#') {
        this.skipComment();
        continue;
      }
      
      if (this.currentChar === ';') {
        this.advance();
        return { type: TokenType.SEMICOLON, value: ';' };
      }
      
      if (/[0-9]/.test(this.currentChar)) {
        return { type: TokenType.NUMBER, value: this.number() };
      }
      
      if (this.currentChar === '"') {
        return { type: TokenType.STRING, value: this.string() };
      }
      
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.identifier();
      }
      
      if (this.currentChar === '[') {
        return this.list();
      }
      
      switch (this.currentChar) {
        case '+':
          this.advance();
          return { type: TokenType.PLUS, value: '+' };
        case '-':
          this.advance();
          return { type: TokenType.MINUS, value: '-' };
        case '*':
          this.advance();
          return { type: TokenType.MULTIPLY, value: '*' };
        case '/':
          this.advance();
          return { type: TokenType.DIVIDE, value: '/' };
        case '^':
          this.advance();
          return { type: TokenType.POWER, value: '^' };
        case '$':
          this.advance();
          return { type: TokenType.FLOOR_DIVIDE, value: '$' };
        case '%':
          this.advance();
          return { type: TokenType.MODULO, value: '%' };
        case '=':
          this.advance();
          if (this.currentChar === '=') {
            this.advance();
            return { type: TokenType.EQUAL, value: '==' };
          }
          return { type: TokenType.EQUAL, value: '=' };
        case '/':
          this.advance();
          if (this.currentChar === '=') {
            this.advance();
            return { type: TokenType.NOT_EQUAL, value: '/=' };
          }
          throw new Error(`Unexpected character: /`);
        case '>':
          this.advance();
          if (this.currentChar === '=') {
            this.advance();
            return { type: TokenType.GREATER_EQUAL, value: '>=' };
          }
          return { type: TokenType.GREATER, value: '>' };
        case '<':
          this.advance();
          if (this.currentChar === '=') {
            this.advance();
            return { type: TokenType.LESS_EQUAL, value: '<=' };
          }
          return { type: TokenType.LESS, value: '<' };
        case '(':
          this.advance();
          return { type: TokenType.LPAREN, value: '(' };
        case ')':
          this.advance();
          return { type: TokenType.RPAREN, value: ')' };
        case ',':
          this.advance();
          return { type: TokenType.COMMA, value: ',' };
        case '.':
          this.advance();
          return { type: TokenType.DOT, value: '.' };
        case ':':
          this.advance();
          return { type: TokenType.COLON, value: ':' };
      }
      
      throw new Error(`Unexpected character: ${this.currentChar}`);
    }
    
    return { type: TokenType.EOF, value: null };
  }
}

module.exports = { Lexer, TokenType };
