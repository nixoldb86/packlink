# Created by a.olmedo at 27/10/18
Feature: #Test cases to manage draft shipments

  Background: the user gets to the packlink url
    Given the user gets to the login url
    Given the user fill input his email "tepohu@eggnova.com"
    And the user fill input his password "1234qwer"
    And click on submit button
    And the user will be in shipments view

  Scenario: Create a draft
    Given the user clicks on add new shipment
    Then the user will be in create shipment form
    And at this moments exists n items
    When the user fill input weight "10"
    And the user fill input length "2"
    And the user fill input width "2"
    And the user fill input height "2"
    When clicks on save draft button
    Then the user return to Shipments view
    And will exist one item more
