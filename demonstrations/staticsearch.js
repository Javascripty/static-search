class StaticSearch {

    // Private field declarations
    #_settings;
    #_form;
    #_input;
    #_searchableJsonData;

    // Default StaticSearch.js settings
    #_defaults = {
        pathToTheSearchableData: null,
        searchFormId: "#static-search-form",
        searchFormInputId: "#static-search-query",
        searchResultsTemplate: null,
        noSearchResultsFoundTemplate: `<p id="no-results-found">...Sorry no search results found</p>`,
        showStaticSearchLogo: true
    };

    // Private method declarations
    /**
     * Test wheter the provided query string matches any of the property values of each object in the array of objects (data).
     * 
     * @param {String} query. Entered search query string to test for matches.
     * @param {Array} data. An array of objects, whose property values will check for search query string matches.
     * 
     * @returns {Array} results. An array of objects whose property values matched the search query string or an empty array if no search query matches where found.
    */
    #_stringMatching = function ({ query, data }) {

        // An array of all objects whose property values matched the search query string.
        let matches = data.filter(function (object) {

            // Convert the search query string into a RegExp.
            let regularExpression = new RegExp(query, 'gi');

            // Initialized a variable labeled boolean with the default value of false.
            let boolean = false;

            // Test for matches on each property in the object.
            for (let property in object) {

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

        return matches;
    };

    // Define instance properties
    constructor(options = {}) {
        this.#_settings = Object.assign({}, this.#_defaults, options);
        this.#_input = document.querySelector(`${this.#_settings.searchFormInputId}`);
        this.#_form = document.querySelector(`${this.#_settings.searchFormId}`);

        // Event listeners
        /**
         * On #static-search-form "mouseover" event fetch the searchable json data
         * Note: this event will fire only once.
         */
        this.#_form.addEventListener('mouseover', async (event) => {

            // Check if the searchable json data is available in sessionStorage
            if (sessionStorage.getItem("searchable-json-data")) {
                // Set the searachable json data
                this.#_searchableJsonData = JSON.parse(sessionStorage.getItem("searchable-json-data"));
            }
            else {
                // If not then send a fetch request for the searchable json data, and store it into sessionStorage
                try {
                    // Fetch the searchable json data
                    let response = await fetch(this.#_settings.pathToTheSearchableData);

                    // If the fetch failed, throw an error
                    if (!response.ok) {
                        throw "Sorry couldn't fetch the data";
                    }

                    // Set the searchable data to a private instance field
                    this.#_searchableJsonData = await response.json();

                    // Save the searchable json data to sessionStorage
                    sessionStorage.setItem("searchable-json-data", JSON.stringify(this.#_searchableJsonData));
                }
                catch (error) {
                    console.log(`Sorry couldn't fetch the data:\nError-code: ${error.code}\nError-message: ${error.message}`);
                }
            }

        }, { once: true });

        // On search form 'submit' event do the following.
        this.#_form.addEventListener('submit', (event) => {

            // prevent default submit behaviour.
            event.preventDefault();

            // remove any previously rendered <#result> components.
            let child = document.querySelector("#result");

            if (child != null) {
                this.#_form.removeChild(child);
            }

            // Search the "searchable-data" for objects whose property values match the query string.
            // Returns an array of objects whose property(ies) contain at least one match to the query string.
            let matches = this.#_stringMatching({
                query: this.#_input.value,
                data: this.#_searchableJsonData
            });

            // Render the results
            // The element that will hold the provided results template
            let results = document.createElement("ul");
            results.setAttribute('id', 'result');

            if (this.#_settings.showStaticSearchLogo) {
                // The StaticSearch logo that displays on the bottom of the search results
                let logo = document.createElement('li');
                logo.setAttribute('id', 'logo');
                logo.innerHTML = `<p>Search provided by <a href="https://twitter.com/Eduardo__Uribe">staticsearch.com</a></p>`;

                results.append(logo);
            }

            // If there are no matches
            if (matches.length <= 0) {

                // The element that will hold the no results found message
                let noresults = document.createElement("li");

                // Insert the no results message
                noresults.innerHTML = this.#_settings.noSearchResultsFoundTemplate;

                results.prepend(noresults);

                // Render the no results message
                return this.#_form.append(results);
            } else {

                // Render the search results
                let subcomponent = this.#_settings.searchResultsTemplate(matches);

                results.prepend(subcomponent);

                // Render the search results
                this.#_form.append(results);
            }
        });

        // Close the search results ui component when the person clicks out of the form
        document.addEventListener("click", (event) => {

            if (event.target !== this.#_form) {

                // remove any previously rendered <#result> components.
                let child = document.querySelector("#result");

                if (child != null) {
                    this.#_form.removeChild(child);
                }
            }
        });
    }
}