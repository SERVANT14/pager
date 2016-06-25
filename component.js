import UrlUtils from '../../../../../modules/utils/Url';

export default {
    template: require('./template.html'),
    props: {
        baseUrl: {
            type: String,
            required: true
        },
        currentPage: {
            type: String,
            required: true
        },
        totalPages: {
            type: String,
            required: true
        },
        maxPageButtons: {
            default: 5
        },
        pageUrlKey: {
            type: String,
            default: 'page'
        }
    },
    data: function () {
        return {
            pages: []
        };
    },
    computed: {
        previousPageNumber: function () {
            return (this.currentPage > 1 ? parseInt(this.currentPage, 10) - 1 : null);
        },
        nextPageNumber: function () {
            return (this.currentPage == this.totalPages ? null : parseInt(this.currentPage, 10) + 1 );
        },
        previousButtonUrl: function () {
            return (this.previousPageNumber > 0 ? this.getUrlForPage(this.previousPageNumber) : null);
        },
        nextButtonUrl: function () {
            return (this.nextPageNumber > 0 ? this.getUrlForPage(this.nextPageNumber) : null);
        }
    },
    events: {
        'hook:created': function () {
            this.setupPages();
        }
    },
    methods: {
        /**
         * Prompts the user for a page to jump to and then jumps to it if it's in-range.
         */
        jumpToPage: function () {
            var jumpTo = null;

            do
            {
                jumpTo = parseInt(prompt(`Jump to page (1 - ${this.totalPages}):`), 10);

                if (isNaN(jumpTo)) {
                    return;
                }
            } while (jumpTo < 1 || jumpTo > this.totalPages);

            UrlUtils.goTo(this.getUrlForPage(jumpTo));
        },

        /**
         * The url that the user should be directed to when they click on this column.
         *
         * @param {number} pageNumber
         *
         * @returns {string}
         */
        getUrlForPage: function (pageNumber) {
            var params = {};

            params[this.pageUrlKey] = pageNumber;

            return UrlUtils.setQueryParams(this.baseUrl, params);
        },

        /**
         * Add a number of pages.
         *
         * @param startNumber The page number to start with.
         * @param upToNumbers A set of numbers to count up to; choosing whichever is smallest.
         */
        addPages: function (startNumber, upToNumbers) {
            var upTo = Math.min(...upToNumbers);

            for (var i = startNumber; i <= upTo; i++) {
                if (!this.pageNumberIncluded(i)) {
                    this.addPageNumber(i);
                }
            }
        },

        /**
         * Add the "..." page button to signify skipping page numbers.
         */
        addEllipsisPage: function () {
            this.addPageNumber(null);
        },

        /**
         * Add a page number to the list of pages to display.
         *
         * @param number
         */
        addPageNumber: function (number) {
            if (number === null) {
                this.pages.push({
                    number: null,
                    url: null
                });
            }
            else {
                this.pages.push({
                    number: number,
                    url: this.getUrlForPage(number)
                });
            }
        },

        /**
         * Tells you if the given page number is in the list of pages we have.
         *
         * @param pageNumber
         *
         * @returns {boolean}
         */
        pageNumberIncluded: function (pageNumber) {
            return this.pages.some(page => page.number == pageNumber);
        },

        /**
         * Setup the pages that we'll need to display based on the given settings.
         */
        setupPages: function () {
            this.pages = [];

            if (this.currentPage <= this.maxPageButtons) {
                // Current page is close to the first page.
                this.addPages(1, [this.maxPageButtons, this.totalPages]);

                if (this.totalPages > this.maxPageButtons) {
                    // The total number of pages is beyond what we have set to show.
                    if (this.totalPages > parseInt(this.maxPageButtons, 10) + 1) {
                        // Last page is not just the next page, need an ellipsis.
                        this.addEllipsisPage();
                    }

                    this.addPageNumber(this.totalPages);
                }
            }
            else if (parseInt(this.totalPages, 10) - 3 < this.currentPage) {
                // Current page is close to the last page.
                this.addPages(1, [2]);
                this.addEllipsisPage();
                this.addPages(parseInt(this.totalPages, 10) - 3, [this.totalPages]);
            }
            else {
                // Current page is not close to the first or last pages.
                this.addPages(1, [2]);
                this.addEllipsisPage();
                this.addPageNumber(parseInt(this.currentPage, 10) - 1);
                this.addPageNumber(this.currentPage);
                this.addPageNumber(parseInt(this.currentPage, 10) + 1);
                this.addEllipsisPage();
                this.addPageNumber(this.totalPages);
            }
        }
    }
};
