/**
 * Highlight keywords in the provided string.
 * @param {String} string The string to highlight keywords on
 * @param {String} keyword The keyword to highlight
 * @return {String} A modified copy of the provided string with keyword(s) highlighted
 */
function highlight({ string, keyword }) {
    return string.replace(new RegExp(`${keyword}`, "ig"), function (match) {
        return `<b>${match}</b>`;
    });
}

export default highlight;