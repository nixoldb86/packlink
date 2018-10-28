# -*- coding: utf-8 -*-

import logging
from behave import *

logging.basicConfig(level=logging.DEBUG)

__author__ = 'nixoldb86'


@Given('the user fill input his email "{email}"')
def step_impl(context, email):
    assert (context.packlink_login_actions.input_email(email=email)) is True


@Given('the user fill input his password "{password}"')
def step_impl(context, password):
    assert (context.packlink_login_actions.input_password(password=password)) is True


@Given('click on submit button')
def step_impl(context):
    assert (context.packlink_login_actions.click_submit_button()) is True


@Then('the shipments list will empty')
def step_impl(context):
    assert (context.packlink_search_actions.is_shipments_void()) is True


@When('the user will search one item exists "{item}"')
def step_impl(context, item):
    assert (context.packlink_search_actions.input_item_search(item=item)) is True


@When('click on search button')
def step_impl(context):
    assert (context.packlink_search_actions.click_search_button()) is True


@Then('the user will select the first item on the list to complete it')
def step_impl(context):
    assert (context.packlink_search_actions.click_complete_button()) is True
