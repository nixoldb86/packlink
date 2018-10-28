# -*- coding: utf-8 -*-
from packlink.commons.selenium_utils import SeleniumUtils
from packlink.packlink_selenium.register.xpath import PacklinkRegisterXpath
from packlink.packlink_selenium.search.xpath import PacklinkSearchXpath

__author__ = 'nixoldb86'


class PacklinkSearchActions(object):
    """
    Class to perform "Search" actions.
    """

    def __init__(self, driver):
        self.driver = driver
        self.utils = SeleniumUtils(self.driver)
        self.register_xpath = PacklinkRegisterXpath()
        self.search_xpath = PacklinkSearchXpath()

    def is_shipments_void(self):
        """
        Check if the shipment list is empty
        :return:
        """
        return True if self.utils.is_element_present(self.search_xpath.div_shipment_empty) else False

    def input_item_search(self, item):
        """
        Input item searched
        :param item:
        :return:
        """
        return True if self.utils.fill_input(self.search_xpath.input_search, item) else False

    def click_search_button(self):
        """
        Click on complete button
        :return:
        """
        return True if self.utils.click_by_css(self.search_xpath.button_search) else False

    def click_complete_button(self):
        """
        Click on complete button
        :return:
        """
        return True if self.utils.click_by_css(self.search_xpath.button_complete) else False
