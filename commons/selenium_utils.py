# -*- coding: utf-8 -*-

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import selenium.webdriver.support.ui as ui

__author__ = 'nixoldb86'


class SeleniumUtils(object):
    """
    Class with some basic utilities for getting started with the selenium elements
    """

    def __init__(self, driver=None, wait_timeout=5000):
        if driver is None:
            self.driver = webdriver.Firefox()
        else:
            self.driver = driver
        self.wait_timeout = wait_timeout

    def wait_for_displayed(self, xpath):
        """
        Wait the timeout seconds defined in the init for the element
        :param xpath:
        :return: true if its present, false if not
        """

        wait = ui.WebDriverWait(self.driver, self.wait_timeout)
        try:
            wait.until(lambda bool: self.driver.find_element_by_css_selector(xpath).is_displayed())
            return True
        except TimeoutException:
            return False

    def click_by_css(self, xpath):
        """
        Wait for the element given by xpath to be visible and then click on it
        :param xpath:
        :return:
        """
        element = self.wait_for_displayed(xpath)
        if element:
            self.driver.find_element_by_css_selector(xpath).click()
            return True
        else:
            return False

    def get_current_url(self):
        """
        Obtain current url
        :return:
        """

        return self.driver.current_url

    def fill_input(self, xpath, value):
        """
        Wait for the element given by xpath to be visible and then input the value given
        :param xpath: css
        :param value:
        :return:
        """
        element = self.wait_for_displayed(xpath)
        if element:
            input_field = self.driver.find_element_by_css_selector(xpath)
            input_field.clear()
            input_field.send_keys(value)
            return True
        else:
            return False

    def is_element_present(self, xpath):
        """
        Look if the element given exist and is displayed
        :param xpath:
        :return:
        """
        try:
            self.driver.find_element_by_css_selector(xpath).is_displayed()
            return True
        except NoSuchElementException:
            return False

    def wait_for_not_displayed_xpath(self, xpath):
        """
        Wait the timeout seconds defined in the init for the element
        :param xpath:
        :return: true if its NOT present, false if so
        """

        wait = ui.WebDriverWait(self.driver, self.wait_timeout)
        try:
            wait.until_not(lambda bool: self.driver.find_element_by_css_selector(xpath))
            return True
        except TimeoutException:
            return False
