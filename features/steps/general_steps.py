# -*- coding: utf-8 -*-
from behave import step

__author__ = 'nixoldb86'


@step(u'the user gets to the packlink url in register view')
def step_imple(context):
    app_url = context.conf['url']['base']
    demo_url = context.conf['url']['register']
    url = "".join([app_url, demo_url])
    context.browser.get(url)


@step(u'the user gets to the login url')
def step_imple(context):
    app_url = context.conf['url']['base']
    demo_url = context.conf['url']['login']
    url = "".join([app_url, demo_url])
    context.browser.get(url)
