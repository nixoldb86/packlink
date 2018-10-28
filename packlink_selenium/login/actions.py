# -*- coding: utf-8 -*-
from packlink.commons.selenium_utils import SeleniumUtils
from packlink.packlink_selenium.login.xpath import PacklinkLoginXpath

__author__ = 'nixoldb86'


class PacklinkLoginActions(object):
    """
    Class to perform "Login" actions.
    """

    def __init__(self, driver):
        self.driver = driver
        self.utils = SeleniumUtils(self.driver)
        self.login_xpath = PacklinkLoginXpath()


    def input_email(self, email):
        """
        Input email
        :param email:
        :return: boolean
        """
        return True if self.utils.fill_input(self.login_xpath.input_email_login, email) else False

    def input_password(self, password):
        """
        Input password
        :param password:
        :return: boolean
        """
        return True if self.utils.fill_input(self.login_xpath.input_pass_login, password) else False

    def click_submit_button(self):
        """
        Click on submit button
        :return:
        """
        return True if self.utils.click_by_css(self.login_xpath.submit_button) else False