let data = [
    {
        title: "Eleventy is a simpler static site generator",
        content: "My solution"
    },
    {
        title: "eleventy is cool",
        content: "Eleventy is a cool function"
    },
    {
        title: "Not about an ssg",
        content: "not..."
    }
];

// Array of matching objects
let matches = data.filter(function (object) {
    for (let property in object) {
        if (stringMatching({ word: "eleventy", string: object[property] })) {
            return true;
        }
    }
});

