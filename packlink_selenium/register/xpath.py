# -*- coding: utf-8 -*-
__author__ = 'nixoldb86'

class PacklinkRegisterXpath(object):
    """
    CSS locators for register view
    """
    input_email = 'input#register-email'
    input_pass = 'input#register-password'
    input_telephone = 'input#register-tel'
    select_shipments = 'select#register-shipments option[value="1 - 10"]'
    select_platform = 'select#register-platform option[value="eBay"]'
    select_ecommerce = 'select#register-ecommerce option[value="PrestaShop"]'
    checkbox_terms = 'input#register-termsAndConditions'
    checkbox_data = 'input#register-dataProcessing'
    button_register = 'button#register-submit'
    text_error_register = 'span#register-error-msg'
