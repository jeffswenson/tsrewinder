/**
 * Utilities used to make interacting with the typescript ast great again.
 */

 import * as ts from "typescript";

 export function parse(text : string) {
     let ast = ts.createSourceFile("DYNAMIC_FILE", text, ts.ScriptTarget.ES2016, true);

     if ((ast as any).parseDiagnostics.length > 0) {
         throw new Error("Failed to parse: " + text);
     }

     return ast;
 }

 export function findNodes(ast : ts.Node, includeIf : (node : ts.Node) => boolean) {
    var nodes : ts.Node [] = [];
    ts.forEachChild(ast, (node) => {
        nodes = nodes.concat(findNodes(node, includeIf));
        if (includeIf(node)) {
            nodes.push(node);
        }
    });
    return nodes;
 }

 export function findNextNode(ast : ts.Node, includeIf : (node : ts.Node) => boolean) {
     let nodes = findNodes(ast, includeIf);
     if (nodes.length === 0) {
         return null;
     } else {
         return nodes[0];
     }
 }

export function getNodeText(ast : ts.Node) {
    let sourceFile = ast.getSourceFile();
    return sourceFile.text.slice(ast.pos, ast.end);
}
