# -*- coding: utf-8 -*-
import logging
from packlink.commons.selenium_utils import SeleniumUtils
from packlink.packlink_selenium.draft.xpath import PacklinkDraftXpath

__author__ = 'nixoldb86'


class PacklinkDraftActions(object):
    """
    Class to perform "Draft" actions.
    """

    def __init__(self, driver):
        self.driver = driver
        self.utils = SeleniumUtils(self.driver)
        self.draft_xpath = PacklinkDraftXpath()

    def click_new_shipment(self):
        """
        :return: boolean
        """
        return True if self.utils.click_by_css(self.draft_xpath.button_new_shipment) else False

    def is_in_details_new_shipment(self, app_url):
        """
        Check if the user is details of new shipment
        :return:
        """
        self.utils.wait_for_displayed(self.draft_xpath.details_new_shipment)
        if self.utils.get_current_url() == "".join([app_url, "/private/shipments/create/info"]):
            return True
        else:
            logging.info(
                "The user is not in Details of new shipment view. The user is in : " + self.utils.get_current_url())
            return False

    def count_items(self):
        count = self.driver.find_elements_by_css_selector(self.draft_xpath.number_items)
        return len(count)

    def input_weight(self, weight):
        return True if self.utils.fill_input(self.draft_xpath.input_weight, weight) else False

    def input_length(self, length):
        return True if self.utils.fill_input(self.draft_xpath.input_length, length) else False

    def input_width(self, width):
        return True if self.utils.fill_input(self.draft_xpath.input_width, width) else False

    def input_height(self, height):
        return True if self.utils.fill_input(self.draft_xpath.input_height, height) else False

    def click_save_button(self):
        return True if self.utils.click_by_css(self.draft_xpath.button_save_draft) else False

    def return_shipment_view(self):
        return True if self.utils.wait_for_not_displayed_xpath(self.draft_xpath.button_save_draft) else False
