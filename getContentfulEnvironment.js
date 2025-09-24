// Generate typings from your Contentful environment.
// eslint-disable-next-line no-undef,@typescript-eslint/no-var-requires
const contentfulManagement = require('contentful-management');

const CONTENTFUL_SPACE_ID = 'pixe68huo2dd';
const CONTENTFUL_ENVIRONMENT = 'content';

// eslint-disable-next-line no-undef
module.exports = function() {
    const contentfulClient = contentfulManagement.createClient({
        accessToken: 'CONTENT_MANAGEMENT_TOKEN',
    });

    return contentfulClient
        .getSpace(CONTENTFUL_SPACE_ID)
        .then(space => space.getEnvironment(CONTENTFUL_ENVIRONMENT));
};
