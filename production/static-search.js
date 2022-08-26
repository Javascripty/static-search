/**
 * Creates a new StaticSearch instance.
 * @class
 * @author Eduardo Javier Uribe.
 * @version 1.0.0
 */
class StaticSearch {

    // Private field declarations
    #settings;
    #form;
    #input;
    #searchableData;

    // Default static-search settings
    #defaults = {
        pathToTheSearchableData: undefined,
        searchFormId: "#static-search-form",
        searchFormInputId: "#static-search-query",
        searchResultsTemplate: undefined,
        noSearchResultsFoundMessage: "Sorry no search results found",
        showStaticSearchLogo: true,
        highlightKeywords: true,
    };

    // Define: instance properties
    constructor(options = {}) {
        this.#settings = Object.assign({}, this.#defaults, options);
        this.#input = document.querySelector(`${this.#settings.searchFormInputId}`);
        this.#form = document.querySelector(`${this.#settings.searchFormId}`);

        // Event listeners

        // Fetch searchable data
        this.#form.addEventListener("mouseover", async (event) => {

            // Check if the searchable data is available in sessionStorage
            if (sessionStorage.getItem("searchable-json-data")) {

                // Set the searachable data
                this.#searchableData = JSON.parse(sessionStorage.getItem("searchable-json-data"));
            }
            else {

                // If not: send a fetch request for the searchable data, and also store in sessionStorage
                try {
                    // Fetch the searchable data
                    let response = await fetch(this.#settings.pathToTheSearchableData);

                    // If the fetch failed, throw an error
                    if (!response.ok) {
                        throw "Sorry couldn't fetch the data";
                    }

                    // Set the searchable data to a private instance field.
                    this.#searchableData = await response.json();

                    // Save the searchable json data to sessionStorage.
                    sessionStorage.setItem("searchable-json-data", JSON.stringify(this.#searchableData));
                }
                catch (error) {
                    console.log(`Sorry couldn't fetch the data:\nError-code: ${error.code}\nError-message: ${error.message}`);
                }
            }

        }, { once: true });

        // Render search matches.
        this.#form.addEventListener("submit", (event) => {

            // Prevent the default "submit" behaviour.
            event.preventDefault();

            // Remove any previously rendered <static-search-results> components.
            let component = document.querySelector("#static-search-results");

            if (component != null) {
                this.#form.removeChild(component); 
            }

            
            // Search for matches.
            // "Deep-clone" of the searchable data.
            let searchableDataClone = structuredClone(this.#searchableData);

            // Array of objects whose properties match the search query string.
            let matches = searchableDataClone.filter((object) => {
                    for (let property in object) {
                        if (this.#stringMatching( { word: `${this.#input.value}`, string: object[property] } )) {
                            return true;
                        }
                    }
    
                    return false;
            });

            // Highlight the keywords inside the matching objects.
            if (this.#settings.highlightKeywords) {
                matches.forEach( (object) => {
                    for (let property in object) {
                        object[property] = this.#highlight({ string: object[property], keyword: `${this.#input.value}` });
                    }
                    
                    return;
                });
            }

            // Render the search matches.
            // The component that will hold the returned search matches.
            let results = document.createElement("ul");
            results.setAttribute('id', 'static-search-results');

            // Render the static-search logo.
            if (this.#settings.showStaticSearchLogo) {
                
                let logo = document.createElement('li');
                logo.setAttribute('id', 'static-search-logo');
                logo.innerHTML = `<p>Search provided by <a href="#">static search</a></p>`;

                // Insert the logo after the last child of the results element.
                results.append(logo);
            }

            if (matches.length <= 0) {

                // Render the no search matches found message.
                let noresults = document.createElement("li");
                let message = document.createElement("p");

                message.setAttribute("id", "no-results-found");
                message.innerText = this.#settings.noSearchResultsFoundMessage;
                noresults.append(message);
                results.prepend(noresults);

                // Insert the "no results found" message after the last child of the #form element.
                return this.#form.append(results);

            } else {

                // Render the search matches found.
                let content = matches.map((match) => {

                    let li = document.createElement("li");
                    li.setAttribute("class", "result-item");
                    li.innerHTML = this.#settings.searchResultsTemplate(match);

                    return li.outerHTML;

                }).join("");

                results.innerHTML = content;

                this.#form.append(results);
            }
        });

        // Remove search results.
        document.addEventListener("click", (event) => {
            if (event.target !== this.#form) {

                // Remove any previously rendered search results.
                let results = document.querySelector("#static-search-results");

                if (results != null) {
                    this.#form.removeChild(results);
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
}

export { StaticSearch as default };
