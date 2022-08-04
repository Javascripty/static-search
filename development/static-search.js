/**
 * Creates a new StaticSearch instance.
 * @class
 * @author Eduardo Javier Uribe <ed2711uribe@gmail.com>
 * @version 1.0.0
 */
class StaticSearch {

    // Private field declarations
    #settings;
    #form;
    #input;
    #searchableData;

    // Default search settings
    #defaults = {
        pathToTheSearchableData: undefined,
        searchFormId: ".static-search-form",
        searchFormInputId: ".static-search-query",
        searchResultsTemplate: undefined,
        noSearchResultsFoundTemplate: `<p class="no-results-found">...Sorry no search results found</p>`,
        showStaticSearchLogo: true,
        highlightKeywords: true,
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
                this.#searchableData = JSON.parse(sessionStorage.getItem("searchable-json-data"));
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
                    this.#searchableData = await response.json();

                    // Save the searchable json data to sessionStorage
                    sessionStorage.setItem("searchable-json-data", JSON.stringify(this.#searchableData));
                }
                catch (error) {
                    console.log(`Sorry couldn't fetch the data:\nError-code: ${error.code}\nError-message: ${error.message}`);
                }
            }

        }, { once: true });

        // On search form "submit" event
        this.#form.addEventListener("submit", (event) => {

            // Prevent the default "submit" behaviour.
            event.preventDefault();

            // Process to remove any previously rendered <.static-search-result> components.
            let component = document.querySelector(".static-search-result");

            if (component != null) {
                this.#form.removeChild(component); 
            }

            
            // Process to search for matches:

            // Create a deep-clone of the searchable data.
            let searchableDataClone = structuredClone(this.#searchableData);

            // An array of objects whose properties match the search query string
            let matches = searchableDataClone.filter((object) => {
                    for (let property in object) {

                        if (this.#stringMatching({ 
                            word: `${this.#input.value}`, 
                            string: object[property] 
                        })) {
                            return true;
                        }
                    }
    
                    return false;
            });

            if (this.#settings.highlightKeywords) {
                // Highlight the keywords inside the matching objects.
                matches.forEach( (object) => {
                    for (let property in object) {
                        object[property] = this.#highlight({ string: object[property], keyword: `${this.#input.value}` });
                    }
                    
                    return;
                });
            }

            // Process to render the search results:

            // The component that will hold the returned search results
            let results = document.createElement("ul");
            results.setAttribute('class', 'static-search-result');

            // If there are no search matches found:
            if (matches.length <= 0) {

                // The element that will hold the no results found message
                let noresults = document.createElement("li");

                // Insert the no results message
                noresults.innerHTML = this.#settings.noSearchResultsFoundTemplate;

                results.prepend(noresults);

                // Insert the "no results found" message after the last child of the #form element.
                return this.#form.append(results);
            } else {

                // Process to render the search matches found:

                // Content for the search results found.
                let content = matches.map((match) => {

                    let li = document.createElement("li");
                    li.setAttribute("class", "result-item")
                    li.innerHTML = this.#settings.searchResultsTemplate(match);

                    return li.outerHTML;

                }).join("");

                results.innerHTML = content;

                // Insert the static search logo?
                if (this.#settings.showStaticSearchLogo) {

                    let logo = document.createElement('li');
                    logo.setAttribute('class', 'static-search-logo');
                    logo.innerHTML = `<p>Search provided by <a href="#">static search</a></p>`;

                    // Insert the logo after the last child of the results element.
                    results.append(logo);
                }

                // Insert the search results component.
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