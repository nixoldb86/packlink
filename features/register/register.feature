# Created by a.olmedo at 27/10/18
Feature: #Test cases to cover user register
  # We will cover main cases to verify user register.


  Background: the user gets to the packlink url
    Given the user gets to the packlink url in register view


  Scenario: #Happy path
    Given the user is in register view
    When the user fill input the email random
    And the user fill input the password
    And the user fill input the telephone
    And the user select one element on the shipments per month list
    And the user select one element on the marketplaces list
    And the user select one element on the online shop list
    And the user click on terms and conditions
    And the user click on privacy policy
    And click on register button
    Then the user will be in shipments view

  Scenario Outline: #Corner cases email field
    Given the user is in register view
    When the user fill input the "<email>"
    And the user fill input the password
    And the user fill input the telephone
    And the user select one element on the shipments per month list
    And the user select one element on the marketplaces list
    And the user select one element on the online shop list
    And the user click on terms and conditions
    And the user click on privacy policy
    And click on register button
    Then will appear an error message info
    And the user is in register view

    Examples:
      | email           |
      | @               |
      | .@.             |
      | @test.com       |
      | test@.com       |
      | test@           |
      | test@test       |
      | test a@test.com |


  Scenario: #Corner cases mandatory fields
    Given the user is in register view
    When the user fill input the email random
    And click on register button
    Then the user is in register view
    When the user fill input the password
    And click on register button
    Then the user is in register view
    When the user fill input the telephone
    And click on register button
    Then the user is in register view
    When the user select one element on the shipments per month list
    And click on register button
    Then the user is in register view
    When the user select one element on the marketplaces list
    And click on register button
    Then the user is in register view
    When the user select one element on the online shop list
    And click on register button
    Then the user is in register view
    When the user click on terms and conditions
    And click on register button
    Then the user is in register view

  Scenario: #Corner case: user exists yet
    Given the user is in register view
    When the user fill input the email exists yet
    And the user fill input the password
    And the user fill input the telephone
    And the user select one element on the shipments per month list
    And the user select one element on the marketplaces list
    And the user select one element on the online shop list
    And the user click on terms and conditions
    And the user click on privacy policy
    And click on register button
    Then the user is in register view
    And will appear an error message info

