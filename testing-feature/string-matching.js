#_stringMatching = function ({ query, data }) {

    // An array of all objects whose property values matched the search query string.
    let matches = data.filter(function (object) {

        // Convert the search query string into a RegExp.
        let regularExpression = new RegExp(query, 'gi');

        // Initialized a variable labeled boolean with the default value of false.
        let boolean = false;

        // Test for matches on each property in the object.
        for (let property in object) {
            console.log(regularExpression.test(object[property]));//FIXME:
            // Does the object property value match the search query string.
            if (regularExpression.test(object[property])) {

                // Reassign the variable 'boolean' the value true;
                boolean = true;

                // Exit script once a match is found.
                break;
            }
        }

        return boolean;
    });
    console.log(matches); //FIXME:
    return matches;
};