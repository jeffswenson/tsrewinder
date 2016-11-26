import * as ts from 'typescript';

/**
 * Produce a TextChange that replaces the node with the specified text.
 * @param  node Node that will be replaced.
 * @param  text Text that will replace the node.
 * @return TextChange that describes the modification that needs to be made to the source file.
 */
export function replaceNode(node : ts.Node, text : string) : ts.TextChange {
    return {
        span: {
            start: node.pos,
            length: node.end - node.pos
        },
        newText: text
    }
}

/**
 * Apply the edits to the source file.
 *
 * @throws If the start of the edit is outside the sourceText.
 * @throws If the end of an edit is outside the sourceText.
 * @throws If two edits overlap and are attempting to edit the same text.
 *
 * @return The file with the edits applied.
 */
export function applyEdits(sourceText : string, edits : ts.TextChange []) {
    edits.sort((left, right) => left.span.start - right.span.start);

    let pieces : string[] = [];
    let currentPosition = 0;

    for (let edit of edits) {
        if (currentPosition > edit.span.start) {
            throw Error("The edits given to applyEdits overlap. This would cause corruption as a result of conflicting edits.");
        }

        pieces.push(sourceText.substring(currentPosition, edit.span.start));
        pieces.push(edit.newText);
        currentPosition = edit.span.start + edit.span.length;
    }
    pieces.push(sourceText.substring(currentPosition, sourceText.length));

    if (currentPosition > sourceText.length) {
        throw Error("The edits given to applyEdits did not stay within the source string. This would cause corruption, because the original text would not be removed as expected.");
    }

    return pieces.join("");
}
