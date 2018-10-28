# -*- coding: utf-8 -*-

import logging
from random import randint
from behave import *

logging.basicConfig(level=logging.DEBUG)

__author__ = 'nixoldb86'


@Step('the user is in register view')
def step_impl(context):
    app_url = context.conf['url']['base']
    assert context.packlink_register_actions.is_in_register_view(app_url) is True


@Step('the user fill input the email random')
def step_impl(context):
    email = str(randint(0, 1000)) + '@test.com'
    assert (context.packlink_register_actions.input_email(email=email)) is True


@When('the user fill input the "{email}')
def step_impl(context, email):
    assert (context.packlink_register_actions.input_email(email=email)) is True


@When('the user fill input the password')
def step_impl(context):
    password = randint(10000000, 99999999)
    assert (context.packlink_register_actions.input_password(password=password)) is True


@When('the user fill input the telephone')
def step_impl(context):
    telephone = randint(600000000, 699999999)
    assert (context.packlink_register_actions.input_telephone(telephone=telephone)) is True


@When('the user select one element on the shipments per month list')
def step_impl(context):
    assert (context.packlink_register_actions.select_shipments()) is True


@When('the user select one element on the marketplaces list')
def step_impl(context):
    assert (context.packlink_register_actions.select_platform()) is True


@When('the user select one element on the online shop list')
def step_impl(context):
    assert (context.packlink_register_actions.select_ecommerce()) is True


@When('the user click on terms and conditions')
def step_impl(context):
    assert (context.packlink_register_actions.click_terms()) is True


@When('the user click on privacy policy')
def step_impl(context):
    assert (context.packlink_register_actions.click_data()) is True


@When('click on register button')
def step_impl(context):
    assert (context.packlink_register_actions.click_register()) is True


@Step('the user will be in shipments view')
def step_impl(context):
    app_url = context.conf['url']['base']
    assert (context.packlink_register_actions.is_in_shipments_view(app_url)) is True


@When('the user fill input the email exists yet')
def step_impl(context):
    # En este step tambien se podría hacer que previamente buscara en BD un email que ya exista en vez de tenerlo "hardcodeado"
    assert (context.packlink_register_actions.input_email(email='zytame@flypicks.com')) is True


@Then('will appear an error message info')
def step_impl(context):
    assert (context.packlink_register_actions.get_text_error()) is True
