# Created by a.olmedo at 27/10/18
Feature: #Test cases to cover searching in Shipments view
  # We will cover main cases to verify searchs in Shipments view


  Background: the user gets to the packlink url
    Given the user gets to the login url

  Scenario: #First time access in app
    Given the user fill input his email "zytame@flypicks.com"
    And the user fill input his password "1234qwer"
    And click on submit button
    When the user will be in shipments view
    Then the shipments list will empty

  Scenario: # Happy path search item exists
    Given the user fill input his email "xoqeg@bookyah.com"
    And the user fill input his password "1234qwer"
    And click on submit button
    Then the user will be in shipments view
    When the user will search one item exists "Madrid -> Madrid. One parcel, 1 kg, 10 cm x 10 cm x 10 cm"
    And click on search button
    Then the user will select the first item on the list to complete it

  Scenario: # Search item that not exists
    Given the user fill input his email "xoqeg@bookyah.com"
    And the user fill input his password "1234qwer"
    And click on submit button
    Then the user will be in shipments view
    When the user will search one item exists "Barcelona -> Barcelona"
    And click on search button
    Then the shipments list will empty

