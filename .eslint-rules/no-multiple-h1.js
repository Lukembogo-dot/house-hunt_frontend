/**
 * ESLint Custom Rule: no-multiple-h1
 * Prevents multiple H1 tags in JSX files for proper SEO heading hierarchy
 */

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow multiple H1 headings in a single file for SEO",
            category: "Best Practices",
            recommended: true,
        },
        messages: {
            multipleH1: "Multiple H1 tags detected. Each page should have exactly one H1 tag for proper SEO hierarchy.",
        },
        schema: [],
    },

    create(context) {
        let h1Count = 0;
        let firstH1Location = null;

        return {
            JSXOpeningElement(node) {
                // Check if this is an H1 tag
                if (node.name && node.name.name === "h1") {
                    h1Count++;

                    if (h1Count === 1) {
                        // Store the location of the first H1
                        firstH1Location = {
                            line: node.loc.start.line,
                            column: node.loc.start.column
                        };
                    } else if (h1Count > 1) {
                        // Report error for second and subsequent H1 tags
                        context.report({
                            node,
                            messageId: "multipleH1",
                            data: {
                                firstLine: firstH1Location.line,
                            },
                        });
                    }
                }
            },
        };
    },
};
