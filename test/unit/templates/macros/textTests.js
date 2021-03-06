const npath = require('path');
const { expect } = require('chai');
const helpers = require('../helpers');

describe('text macro', () => {
  const dirMacros = npath.resolve(__dirname);

  /**
   * Build a DOM object.
   *
   * @param {Object} params Parameters with which to render the template
   * @return {Object} DOM element (cheerio)
   */
  function buildDom(params) {
    const p = Object.assign({
      data: null,
      name: 'TEST',
      label: null,
      options: null,
      errors: null,
    }, params || {});
    return helpers.renderTemplateFile(`${dirMacros}/textTemplate.html`, p);
  }

  /* ----------------------------------------------------------- Basic markup */

  describe('Basic', () => {
    let $;

    before(() => {
      $ = buildDom();
    });

    it('should have an empty label', () => expect($('span[class*="form-label"]').text()).to.be.empty);

    it("should have 'govuk-form-group' class on root element", () => expect($('div').first().hasClass('govuk-form-group')).to.be.true);

    it('should not have any errors', () => {
      expect($('div').first().hasClass('error')).to.be.false; /* eslint-disable-line no-unused-expressions */
      expect($('span.error-message').length).to.equal(0);
    });

    it('should not have a label', () => expect($('label>span[class*=form-label]').text()).to.be.empty);

    it('should not have any hints', () => {
      expect($('.hint-text').length).to.equal(0);
    });
  });

  /* ----------------------------------------------------------------- Labels */

  describe('Labels', () => {
    let $;

    before(() => {
      $ = buildDom({
        label: 'TEST_LABEL',
      });
    });

    it('should have a label', () => {
      expect($('label[class*="govuk-label"]').text()).to.contain('TEST_LABEL');
    });
  });

  /* ----------------------------------------------------------------- Errors */

  describe('Errors', () => {
    let $;

    it("should have a 'govuk-form-group--error' class on the root element", () => {
      $ = buildDom({
        name: 'TEST_ERR',
        errors: {
          TEST_ERR: [{}],
        },
      });
      return expect($('div').first().hasClass('govuk-form-group--error')).to.be.true;
    });

    it("should have a 'govuk-input--error' class on the input element", () => {
      $ = buildDom({
        name: 'TEST_ERR',
        errors: {
          TEST_ERR: [{}],
        },
      });
      return expect($('input').first().hasClass('govuk-input--error')).to.be.true;
    });

    it('should have an error anchor', () => {
      $ = buildDom({
        name: 'TEST_ERR',
        errors: {
          TEST_ERR: [{}],
        },
      });
      expect($('#f-TEST_ERR-error').length).to.equal(1);
    });

    it('should show only the first error messages for each field', () => {
      $ = buildDom({
        name: 'TEST_ERR',
        errors: {
          TEST_ERR: [{
            inline: 'inline_error_message_1',
            validator: 'dummy_error_validator_1',
          }, {
            inline: 'inline_error_message_2',
            validator: 'dummy_error_validator_2',
          }],
        },
      });
      expect($('span.govuk-error-message').length).to.equal(1);
      expect($('span.govuk-error-message').eq(0).text()).to.match(/inline_error_message_1/);
    });

    it('should attach data-validation error info to the input', () => {
      $ = buildDom({
        name: 'TEST_ERR',
        errors: {
          TEST_ERR: [{
            inline: 'inline_error_message_1',
            validator: 'dummy_error_validator_1',
          }],
        },
      });

      const j = JSON.parse($('input').attr('data-validation'));
      expect(j.fn).to.equal('TEST_ERR');
      expect(j.va).to.equal('dummy_error_validator_1');
    });
  });

  /* ------------------------------------------------------- Option: unbolden */

  describe('Option: unbolden', () => {
    it("should replace 'govuk-label--m' class with 'govuk-label'", () => {
      const $ = buildDom({
        label: 'TEST_LABEL',
        options: {
          unbolden: true,
        },
      });
      expect($('label.govuk-label--m').length).to.equal(0);
      expect($('label.govuk-label').length).to.equal(1);
    });
  });

  /* ---------------------------------------------------- Option: hiddenLabel */

  describe('Option: hiddenLabel', () => {
    it("should add 'govuk-visually-hidden' class to label container", () => {
      const $ = buildDom({
        label: 'TEST_LABEL',
        options: {
          hiddenLabel: true,
        },
      });
      return expect($('label>span').hasClass('govuk-visually-hidden')).to.be.true;
    });
  });

  /* ------------------------------------------------- Option: hint, hintHtml */

  describe('Option: hint, hintHtml', () => {
    it("should add a 'hint-text' object, with escaped content", () => {
      const $ = buildDom({
        label: 'TEST_LABEL',
        options: {
          hint: '<b>TEST_HINT</b>',
        },
      });
      expect($('.govuk-hint').length).to.equal(1);
      expect($('.govuk-hint').html()).to.match(/&lt;b&gt;TEST_HINT&lt;\/b&gt;/);
    });

    it("should add a non-empty 'hint-test' object, with unescaped content", () => {
      const $ = buildDom({
        label: 'TEST_LABEL',
        options: {
          hintHtml: '<b>TEST_HINT_HTML</b>',
        },
      });
      expect($('.govuk-hint').length).to.equal(1);
      expect($('.govuk-hint').html()).to.match(/<b>TEST_HINT_HTML<\/b>/);
    });
  });

  /* ----------------------------------------------------------- Option: size */

  describe('Option: size', () => {
    it('should add CSS size class to input', () => {
      const $ = buildDom({
        options: {
          size: 'SIZE_TEST',
        },
      });
      return expect($('input').hasClass('SIZE_TEST')).to.be.true;
    });
  });

  /* ----------------------------------------------------------- Option: size */

  describe('Option: maxlength', () => {
    it("should add 'maxlength' attribute to input", () => {
      const $ = buildDom({
        options: {
          maxlength: '100',
        },
      });
      expect($('input').attr('maxlength')).to.equal('100')
    });
  });

  /* ----------------------------------------------------- Option: labelledBy */

  describe('Option: labelledBy', () => {
    let $;

    before(() => {
      $ = buildDom({
        label: 'TEST_LABEL',
        options: {
          labelledBy: 'TEST_ARIA_ID',
        },
      });
    });

    it('should not have a label', () => {
      expect($('label[class*="form-label"]').length).to.equal(0);
    });

    it("should add an 'aria-labelledby' attribute to the input", () => {
      expect($('input[aria-labelledby]').length).to.equal(1);
    });
  });

  /* ------------------------------------------------ Option: inputPrefixHtml */

  describe('Option: inputPrefixHtml', () => {
    let $;

    before(() => {
      $ = buildDom({
        options: {
          inputPrefixHtml: '<b>TEST_MARKUP</b>',
        },
      });
    });

    it('should show the markup', () => {
      expect($.html()).to.contain('<b>TEST_MARKUP</b>');
    });
  });

  /* ----------------------------------------------- Option: inputPostfixHtml */

  describe('Option: inputPostfixHtml', () => {
    let $;

    before(() => {
      $ = buildDom({
        options: {
          inputPostfixHtml: '<b>TEST_MARKUP</b>',
        },
      });
    });

    it('should show the markup', () => {
      expect($.html()).to.contain('<b>TEST_MARKUP</b>');
    });
  });

  /* ------------------------------------------------------ Option: lineBreak */

  describe('Option: lineBreak', () => {
    let $;

    before(() => {
      $ = buildDom({
        options: {
          lineBreak: true,
        },
      });
    });

    it('should show the horizontal rule', () => {
      expect($('hr').length).to.equal(1);
    });
  });

  /* ------------------------------------------------ Option: inputAttributes */

  describe('Option: inputAttributes', () => {
    it("should add custom 'id' attribute", () => {
      const $ = buildDom({
        name: 'IA',
        data: 'IA_VAL',
        options: {
          inputAttributes: {
            id: 'CUSTOM',
          },
        },
      });
      expect($('input').attr('id')).to.equal('CUSTOM');
    });

    it("should add custom 'data-test' attribute", () => {
      const $ = buildDom({
        options: {
          inputAttributes: {
            'data-test': 'CUSTOM',
          },
        },
      });
      expect($('input').attr('data-test')).to.equal('CUSTOM');
    });
  });
});
