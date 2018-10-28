# -*- coding: utf-8 -*-
import logging
from packlink.commons.selenium_utils import SeleniumUtils
from packlink.packlink_selenium.register.xpath import PacklinkRegisterXpath
from packlink.packlink_selenium.search.xpath import PacklinkSearchXpath

__author__ = 'nixoldb86'


class PacklinkRegisterActions(object):
    """
    Class to perform "Register" actions.
    """

    def __init__(self, driver):
        self.driver = driver
        self.utils = SeleniumUtils(self.driver)
        self.register_xpath = PacklinkRegisterXpath()
        self.search_xpath = PacklinkSearchXpath()

    def is_in_register_view(self, app_url):
        """
        Check if the user is in demo view
        :return:
        """
        if self.utils.get_current_url() == "".join([app_url, "/registro"]):
            return True
        else:
            logging.info("The user is not in Register view. The user is in : " + self.utils.get_current_url())
            return False

    def input_email(self, email):
        """
        Input email
        :param email:
        :return: boolean
        """
        return True if self.utils.fill_input(self.register_xpath.input_email, email) else False

    def input_password(self, password):
        """
        Input password
        :param password:
        :return: boolean
        """
        return True if self.utils.fill_input(self.register_xpath.input_pass, password) else False

    def input_telephone(self, telephone):
        """
        Input telephone
        :param telephone:
        :return: boolean
        """
        return True if self.utils.fill_input(self.register_xpath.input_telephone, telephone) else False

    def select_shipments(self):
        """
        :return: boolean
        """
        # self.utils.click_by_css(self.register_xpath.span_poblacion)
        return True if self.utils.click_by_css(self.register_xpath.select_shipments) else False

    def select_platform(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.register_xpath.select_platform) else False

    def select_ecommerce(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.register_xpath.select_ecommerce) else False

    def click_terms(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.register_xpath.checkbox_terms) else False

    def click_data(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.register_xpath.checkbox_data) else False

    def click_register(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.register_xpath.button_register) else False

    def is_in_shipments_view(self, app_url):
        """
        Check if the user is in demo view
        :return:
        """
        self.utils.is_element_present(self.search_xpath.button_new_shipment)
        if self.utils.get_current_url() == "".join([app_url, "/private/shipments/all"]):
            return True
        else:
            logging.info("The user is not in Shipments view. The user is in : " + self.utils.get_current_url())
            return False

    def get_text_error(self):
        """
        Given a type text obtain the text of this css(xpath)
        :param type_text:
        :return:
        """
        return True if self.driver.find_element_by_css_selector(self.register_xpath.text_error_register) else False
