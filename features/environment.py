# -*- coding: utf-8 -*-

import os
import json
import logging

from packlink.packlink_selenium.register.actions import PacklinkRegisterActions
from packlink.packlink_selenium.login.actions import PacklinkLoginActions
from packlink.packlink_selenium.search.actions import PacklinkSearchActions
from packlink.packlink_selenium.draft.actions import PacklinkDraftActions
from packlink.commons.selenium_utils import SeleniumUtils
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium import webdriver

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

__author__ = 'nixoldb86'


def setup_test_driver(environment, browser, val_time=5):
    """
    Set up a driver to use in the tests.

    :param environment: the environment to run the tests (local, remote)
    :param browser: the browser to run the tests (default: firefox).
    :param val_time: implicitly_wait value.

    :return: the configured driver object.
    """

    driver = None

    if not environment:
        if browser == "chrome":
            driver = webdriver.Chrome('/Users/a.olmedo/Downloads/chromedriver_2')
        elif browser == "firefox":
            firefox_capabilities = DesiredCapabilities.FIREFOX

    else:
        if browser == "chrome":
            driver = webdriver.Remote(
                command_executor=environment,
                desired_capabilities=DesiredCapabilities.CHROME
            )
        elif browser == "firefox":
            driver = webdriver.Remote(
                command_executor=environment,
                desired_capabilities=DesiredCapabilities.FIREFOX
            )

    driver.implicitly_wait(val_time)
    driver.delete_all_cookies()

    return driver


def before_all(context):
    # Load properties.
    path = os.path.dirname(os.path.abspath(__file__))
    config_file = open('{path}/properties.json'.format(path=path))
    context.conf = json.load(config_file)
    context.config_default = False


def before_scenario(context, scenario):
    # Setup webdriver.
    context.browser = setup_test_driver(
        environment=context.conf['webdriver']['environment'],
        browser=context.conf['webdriver']['browser'])

    # Selenium utils.
    SeleniumUtils(context.browser)

    # REGISTER:
    context.packlink_register_actions = PacklinkRegisterActions(context.browser)

    # LOGIN
    context.packlink_login_actions = PacklinkLoginActions(context.browser)

    # SHIPMENTS SEARCH
    context.packlink_search_actions = PacklinkSearchActions(context.browser)

    # DRAFT SHIPMENT
    context.packlink_draft_actions = PacklinkDraftActions(context.browser)


def after_scenario(context, scenario):
    context.browser.quit()
    # Con acceso a la API yo metería aqui una llamada para eliminar aquellos borradores o envíos que no nos
    # interesen para futuras ocasiones, como por ejemplo para el escenario de draft.feature, de esta manera
    # siempre tendremos datos limpios
