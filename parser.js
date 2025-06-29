const { TokenType } = require('./lexer');

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
    this.equUsed = false;
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(`Syntax error: Expected ${tokenType}, got ${this.currentToken.type}`);
    }
  }

  program() {
    const statements = [];
    
    // 第一个语句必须是 equ
    if (this.currentToken.type === TokenType.EQU) {
      statements.push(this.equStatement());
      this.equUsed = true;
    } else {
      throw new Error('Syntax error: First statement must be equ');
    }
    
    // 解析剩余语句
    while (this.currentToken.type !== TokenType.EOF) {
      statements.push(this.statement());
    }
    
    return { type: 'Program', body: statements };
  }

  equStatement() {
    this.eat(TokenType.EQU);
    const device = this.currentToken.value;
    this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.SEMICOLON);
    
    return { type: 'EquStatement', device };
  }

  statement() {
    if (this.currentToken.type === TokenType.OUTPUT) {
      return this.outputStatement();
    } else if (this.currentToken.type === TokenType.INPUT) {
      return this.inputStatement();
    } else if (this.currentToken.type === TokenType.OBINPUT) {
      return this.obinputStatement();
    } else if (this.currentToken.type === TokenType.TURN) {
      return this.turnStatement();
    } else if (this.currentToken.type === TokenType.TURNTO) {
      return this.turntoStatement();
    } else if (this.currentToken.type === TokenType.IF) {
      return this.ifStatement();
    } else if (this.currentToken.type === TokenType.ONE_STEP) {
      return this.oneStepStatement();
    } else if (this.currentToken.type === TokenType.STOP) {
      return this.stopStatement();
    } else if (this.currentToken.type === TokenType.BREAK) {
      return this.breakStatement();
    } else if (this.currentToken.type === TokenType.GB) {
      return this.gbStatement();
    } else if (this.currentToken.type === TokenType.CLOUD) {
      return this.cloudStatement();
    } else if (this.currentToken.type === TokenType.CUSTOM) {
      return this.customStatement();
    } else if (this.currentToken.type === TokenType.RETURN) {
      return this.returnStatement();
    } else if (this.currentToken.type === TokenType.DISPLAY) {
      return this.displayStatement();
    } else if (this.currentToken.type === TokenType.HIDE) {
      return this.hideStatement();
    } else if (this.currentToken.type === TokenType.SETWINDOW) {
      return this.setwindowStatement();
    } else if (this.currentToken.type === TokenType.DRAW) {
      return this.drawStatement();
    } else if (this.currentToken.type === TokenType.WINDOW) {
      return this.windowStatement();
    } else if (this.currentToken.type === TokenType.MUSIC) {
      return this.musicStatement();
    } else if (this.currentToken.type === TokenType.IDENTIFIER) {
      // 可能是变量赋值或函数调用
      const identifier = this.currentToken.value;
      this.eat(TokenType.IDENTIFIER);
      
      if (this.currentToken.type === TokenType.EQUAL) {
        this.eat(TokenType.EQUAL);
        const value = this.expression();
        this.eat(TokenType.SEMICOLON);
        return { type: 'Assignment', name: identifier, value };
      } else if (this.currentToken.type === TokenType.LPAREN) {
        // 函数调用
        this.eat(TokenType.LPAREN);
        const args = [];
        if (this.currentToken.type !== TokenType.RPAREN) {
          args.push(this.expression());
          while (this.currentToken.type === TokenType.COMMA) {
            this.eat(TokenType.COMMA);
            args.push(this.expression());
          }
        }
        this.eat(TokenType.RPAREN);
        this.eat(TokenType.SEMICOLON);
        return { type: 'FunctionCall', name: identifier, args };
      } else {
        throw new Error(`Syntax error: Unexpected token after identifier`);
      }
    } else {
      throw new Error(`Syntax error: Unexpected token ${this.currentToken.type}`);
    }
  }

  // 解析各种语句...
  outputStatement() {
    this.eat(TokenType.OUTPUT);
    this.eat(TokenType.LPAREN);
    const value = this.expression();
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: 'OutputStatement', value };
  }

  inputStatement() {
    this.eat(TokenType.INPUT);
    this.eat(TokenType.LPAREN);
    const prompt = this.currentToken.value;
    this.eat(TokenType.STRING);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: 'InputStatement', prompt };
  }

  obinputStatement() {
    this.eat(TokenType.OBINPUT);
    this.eat(TokenType.LPAREN);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.SEMICOLON);
    return { type: 'ObinputStatement' };
  }

  // 解析其他类型的语句...
  // 此处省略大量解析函数（turnStatement, ifStatement, customStatement等）
  
  expression() {
    return this.logicalOrExpression();
  }

  logicalOrExpression() {
    let left = this.logicalAndExpression();
    
    while (this.currentToken.type === TokenType.OR) {
      const operator = this.currentToken.value;
      this.eat(TokenType.OR);
      const right = this.logicalAndExpression();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  logicalAndExpression() {
    let left = this.comparisonExpression();
    
    while (this.currentToken.type === TokenType.AND) {
      const operator = this.currentToken.value;
      this.eat(TokenType.AND);
      const right = this.comparisonExpression();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  comparisonExpression() {
    let left = this.additiveExpression();
    
    while ([TokenType.EQUAL, TokenType.NOT_EQUAL, TokenType.GREATER, TokenType.LESS, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL].includes(this.currentToken.type)) {
      const operator = this.currentToken.value;
      this.eat(this.currentToken.type);
      const right = this.additiveExpression();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  additiveExpression() {
    let left = this.multiplicativeExpression();
    
    while ([TokenType.PLUS, TokenType.MINUS].includes(this.currentToken.type)) {
      const operator = this.currentToken.value;
      this.eat(this.currentToken.type);
      const right = this.multiplicativeExpression();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  multiplicativeExpression() {
    let left = this.unaryExpression();
    
    while ([TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.POWER, TokenType.FLOOR_DIVIDE, TokenType.MODULO].includes(this.currentToken.type)) {
      const operator = this.currentToken.value;
      this.eat(this.currentToken.type);
      const right = this.unaryExpression();
      left = { type: 'BinaryExpression', operator, left, right };
    }
    
    return left;
  }

  unaryExpression() {
    if ([TokenType.PLUS, TokenType.MINUS, TokenType.NOT].includes(this.currentToken.type)) {
      const operator = this.currentToken.value;
      this.eat(this.currentToken.type);
      const right = this.unaryExpression();
      return { type: 'UnaryExpression', operator, right };
    }
    
    return this.primaryExpression();
  }

  primaryExpression() {
    const token = this.currentToken;
    
    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      return { type: 'NumberLiteral', value: token.value };
    }
    
    if (token.type === TokenType.STRING) {
      this.eat(TokenType.STRING);
      return { type: 'StringLiteral', value: token.value };
    }
    
    if (token.type === TokenType.BOOLEAN) {
      this.eat(TokenType.BOOLEAN);
      return { type: 'BooleanLiteral', value: token.value };
    }
    
    if (token.type === TokenType.LIST) {
      this.eat(TokenType.LIST);
      return { type: 'ListLiteral', value: token.value };
    }
    
    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const expr = this.expression();
      this.eat(TokenType.RPAREN);
      return expr;
    }
    
    if (token.type === TokenType.IDENTIFIER) {
      const name = token.value;
      this.eat(TokenType.IDENTIFIER);
      
      // 检查是否为函数调用
      if (this.currentToken.type === TokenType.LPAREN) {
        this.eat(TokenType.LPAREN);
        const args = [];
        if (this.currentToken.type !== TokenType.RPAREN) {
          args.push(this.expression());
          while (this.currentToken.type === TokenType.COMMA) {
            this.eat(TokenType.COMMA);
            args.push(this.expression());
          }
        }
        this.eat(TokenType.RPAREN);
        return { type: 'FunctionCall', name, args };
      }
      
      return { type: 'Identifier', name };
    }
    
    throw new Error(`Syntax error: Unexpected token ${token.type}`);
  }
}

module.exports = Parser;
