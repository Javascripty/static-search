class StaticSearch {

    // Private field declarations
    #settings;
    #form;
    #input;
    #searchableJsonData;

    // Default search settings
    #defaults = {
        pathToTheSearchableData: undefined,
        searchFormId: ".static-search-form",
        searchFormInputId: ".static-search-query",
        searchResultsTemplate: undefined,
        noSearchResultsFoundTemplate: `<p class="no-results-found">...Sorry no search results found</p>`,
        showStaticSearchLogo: true,
        keywordHighlighting: true
    };

    // Define instance properties
    constructor(options = {}) {
        this.#settings = Object.assign({}, this.#defaults, options);
        this.#input = document.querySelector(`${this.#settings.searchFormInputId}`);
        this.#form = document.querySelector(`${this.#settings.searchFormId}`);

        // Event listeners
        /**
         * On search form "mouseover" event - fetch the searchable json data
         * Note: this event will fire only once.
         */
        this.#form.addEventListener("mouseover", async (event) => {

            // Check if the searchable json data is available in sessionStorage
            if (sessionStorage.getItem("searchable-json-data")) {

                // Set the searachable json data
                this.#searchableJsonData = JSON.parse(sessionStorage.getItem("searchable-json-data"));
            }
            else {

                // If not then send a fetch request for the searchable json data, and store it into sessionStorage
                try {
                    // Fetch the searchable json data
                    let response = await fetch(this.#settings.pathToTheSearchableData);

                    // If the fetch failed, throw an error
                    if (!response.ok) {
                        throw "Sorry couldn't fetch the data";
                    }

                    // Set the searchable data to a private instance field
                    this.#searchableJsonData = await response.json();

                    // Save the searchable json data to sessionStorage
                    sessionStorage.setItem("searchable-json-data", JSON.stringify(this.#searchableJsonData));
                }
                catch (error) {
                    console.log(`Sorry couldn't fetch the data:\nError-code: ${error.code}\nError-message: ${error.message}`);
                }
            }

        }, { once: true });

        // On search form "submit" event
        this.#form.addEventListener("submit", (event) => {

            // prevent default submit behaviour.
            event.preventDefault();

            // remove any previously rendered <#result> components.
            let child = document.querySelector(".static-search-result");

            if (child != null) {
                this.#form.removeChild(child);
            }

            /**
             * comment
             */
            let matches = this.#searchableJsonData.filter((object) => {
                for (let property in object) {

                    if (this.#stringMatching({ word: `${this.#input.value}`, string: object[property] })) {
                        return true;
                    }
                }

                return false;
            });

            /**
             * Return an array of objects whose properties have been hihglighted.
             */
            let modified = matches.map((object) => {

                // Copy of the passed object as to not modify the original reference
                let modified = { ...object };

                for (let property in modified) {
                    modified[property] = this.#highlight({ string: modified[property], keyword: `${this.#input.value}` });
                }

                // return a modified object
                return modified;
            });

            // Render the results
            // The element that will hold the provided results template
            let results = document.createElement("ul");
            results.setAttribute('class', 'static-search-result');

            if (this.#settings.showStaticSearchLogo) {
                // The StaticSearch logo that displays on the bottom of the search results
                let logo = document.createElement('li');
                logo.setAttribute('class', 'static-search-logo');
                logo.innerHTML = `<p>Search provided by <a href="https://twitter.com/Eduardo__Uribe">static search</a></p>`;

                results.append(logo);
            }

            // If there are no matches
            if (matches.length <= 0) {

                // The element that will hold the no results found message
                let noresults = document.createElement("li");

                // Insert the no results message
                noresults.innerHTML = this.#settings.noSearchResultsFoundTemplate;

                results.prepend(noresults);

                // Render the no results message
                return this.#form.append(results);
            } else {

                // The component containing the matching results
                let subcomponent = document.createElement('ul');
                subcomponent.setAttribute('class', 'subcomponent');

                // The results content
                let content = modified.map((match) => {
                    return this.#settings.searchResultsTemplate(match);
                }).join("");

                subcomponent.innerHTML = content;

                results.prepend(subcomponent);

                // Render the search results
                this.#form.append(results);
            }
        });

        // Close the matching search results ui component when the person clicks out of the search form
        document.addEventListener("click", (event) => {
            if (event.target !== this.#form) {

                // remove any previously rendered <#result> components.
                let child = document.querySelector(".static-search-result");

                if (child != null) {
                    this.#form.removeChild(child);
                }
            }
        });
    }

    // Private method declarations
    /**
     * Search for a match between the regular expression and a specified string
     * @param {String} word The word to search for in the string 
     * @parma {String} string The string to search
     * @returns {Boolean} true or false
     */
    #stringMatching({ word, string }) {
        return new RegExp(word, "gi").test(string);
    }

    /**
     * Highlight keywords in the provided string.
     * @param {String} string The string to highlight keywords on
     * @param {String} keyword The keyword to highlight
     * @return {String} A modified copy of the provided string with keyword(s) highlighted
    */
    #highlight({ string, keyword }) {
        return string.replace(new RegExp(`${keyword}`, "ig"), function (match) {
            return `<mark>${match}</mark>`;
        });
    }
};