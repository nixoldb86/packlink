# -*- coding: utf-8 -*-

import logging

logging.basicConfig(level=logging.DEBUG)
from behave import *

__author__ = 'nixoldb86'


@Step('the user clicks on add new shipment')
def step_impl(context):
    assert (context.packlink_draft_actions.click_new_shipment()) is True


@Step('the user will be in create shipment form')
def step_impl(context):
    app_url = context.conf['url']['base']
    assert (context.packlink_draft_actions.is_in_details_new_shipment(app_url)) is True


@When('the user fill input weight "{weight}"')
def step_impl(context, weight):
    assert (context.packlink_draft_actions.input_weight(weight=weight)) is True


@When('the user fill input length "{length}"')
def step_impl(context, length):
    assert (context.packlink_draft_actions.input_length(length=length)) is True


@When('the user fill input width "{width}"')
def step_impl(context, width):
    assert (context.packlink_draft_actions.input_width(width=width)) is True


@When('the user fill input height "{height}"')
def step_impl(context, height):
    assert (context.packlink_draft_actions.input_height(height=height)) is True


@When('clicks on save draft button')
def step_impl(context):
    assert (context.packlink_draft_actions.click_save_button()) is True


@Then('at this moments exists n items')
def step_impl(context):
    context.number_item = context.packlink_draft_actions.count_items()


@Then('the user return to Shipments view')
def step_impl(context):
    assert (context.packlink_draft_actions.return_shipment_view()) is True


@Then('will exist one item more')
def step_impl(context):
    assert context.packlink_draft_actions.count_items() is context.number_item + 1
