import * as ts from 'typescript'

interface EntityRecord {
  [key: string]: number
}

const reservedPropertyNames = Object.getOwnPropertyNames(Object.prototype)
function isReservedPropertyName(propertyName: string): boolean {
  return reservedPropertyNames.includes(propertyName)
}

function addEntity(record: EntityRecord, key: string): void {
  // Make naughty key names safe
  let safeKey = key
  if (isReservedPropertyName(key)) {
    safeKey = `codehawk__${key}`
  }
  if (record[safeKey]) {
    record[safeKey] += 1
  } else {
    record[safeKey] = 1
  }
}

export function gatherEntities(sourceFile: ts.Node): {
  operators: EntityRecord
  operands: EntityRecord
} {
  const operators: EntityRecord = {}
  const operands: EntityRecord = {}

  function visit(node: ts.Node): void {
    // Check for binary expressions
    if (ts.isBinaryExpression(node)) {
      // Add the operator to the operators array
      addEntity(operators, node.kind.toString())
      // operators.push(node.kind.toString())
      // Recursively visit the left and right operands
      visit(node.left)
      visit(node.right)
    }
    // Check for prefix or postfix unary expressions
    else if (
      ts.isPrefixUnaryExpression(node) ||
      ts.isPostfixUnaryExpression(node)
    ) {
      // Add the operator to the operators array
      addEntity(operators, node.kind.toString())
      // Recursively visit the operand
      visit(node.operand)
    }
    // Check for function calls
    else if (ts.isCallExpression(node)) {
      // Recursively visit the function expression and all arguments
      visit(node.expression)
      node.arguments.forEach((arg) => visit(arg))
    }
    // Check for property accesses
    else if (ts.isPropertyAccessExpression(node)) {
      // Recursively visit the expression and the property name
      visit(node.expression)
      visit(node.name)
    }
    // Check for array accesses
    else if (ts.isArrayLiteralExpression(node)) {
      // Recursively visit all elements
      node.elements.forEach((el) => visit(el))
    }
    // Check for object literals
    else if (ts.isObjectLiteralExpression(node)) {
      // Recursively visit all properties
      node.properties.forEach((prop) => {
        if (ts.isShorthandPropertyAssignment(prop)) {
          // If the property is a shorthand assignment, add the identifier to the operands array
          addEntity(operands, prop.name.text)
        } else if (ts.isPropertyAssignment(prop)) {
          // If the property is an assignment, recursively visit the initializer expression and the property name
          visit(prop.initializer)
          visit(prop.name)
        }
      })
    }
    // Check for identifiers, literals, and variable declarations
    else if (ts.isIdentifier(node)) {
      // Add the text of the node to the operands array
      addEntity(operands, node.escapedText.toString())
    } else if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
      addEntity(operands, node.text)
    } else if (ts.isVariableDeclaration(node)) {
      /* @ts-expect-error */
      addEntity(operands, node.name.escapedText)
    }

    // Recursively visit all child nodes
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return {
    operators,
    operands,
  }
}
