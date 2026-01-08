// Registration Form Widget
//
// Email and Instagram username form for beta waitlist signup.
// Auto-detects if user exists and switches between register/check modes.

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../config/theme.dart';
import '../../../core/api/bff_api_client.dart';

class RegistrationForm extends StatefulWidget {
  final dynamic l10n;
  final bool isMobile;
  final bool loading;
  final String? error;
  final Future<void> Function(String email, String instagram) onRegister;
  final Future<void> Function(String email, String instagram) onCheckExisting;

  const RegistrationForm({
    super.key,
    required this.l10n,
    required this.isMobile,
    required this.loading,
    this.error,
    required this.onRegister,
    required this.onCheckExisting,
  });

  @override
  State<RegistrationForm> createState() => _RegistrationFormState();
}

class _RegistrationFormState extends State<RegistrationForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _instagramController = TextEditingController();
  bool _userExists = false;
  bool _checkingEmail = false;
  Timer? _debounceTimer;

  @override
  void dispose() {
    _emailController.dispose();
    _instagramController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return emailRegex.hasMatch(email);
  }

  void _checkUserExists(String email) {
    _debounceTimer?.cancel();

    if (!_isValidEmail(email)) {
      setState(() => _userExists = false);
      return;
    }

    setState(() => _checkingEmail = true);

    _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
      try {
        final apiClient = context.read<BffApiClient>();
        final response = await apiClient.get(
          '/promo/status',
          queryParameters: {'email': email},
        );

        // If we get here without exception, user exists
        // Check if response has data to confirm
        if (mounted) {
          setState(() {
            _userExists = response['data'] != null;
            _checkingEmail = false;
          });
        }
      } catch (e) {
        // 404 or other errors mean user doesn't exist
        if (mounted) {
          setState(() {
            _userExists = false;
            _checkingEmail = false;
          });
        }
      }
    });
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      final email = _emailController.text.trim();
      final instagram = _instagramController.text.trim();

      if (_userExists) {
        widget.onCheckExisting(email, instagram);
      } else {
        widget.onRegister(email, instagram);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF111827).withValues(alpha: 0.5), // gray-900/50
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF1F2937), // gray-800
          width: 1,
        ),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Email field
            _buildLabel('Email'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white),
              decoration: _inputDecoration(widget.l10n.betaEmailPlaceholder),
              onChanged: _checkUserExists,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Email requerido';
                }
                if (!_isValidEmail(value.trim())) {
                  return 'Email inválido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Instagram field
            _buildLabel('Usuario de Instagram'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _instagramController,
              style: const TextStyle(color: Colors.white),
              decoration: _inputDecoration(
                widget.l10n.betaInstagramPlaceholder,
                prefixText: '@',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Usuario de Instagram requerido';
                }
                return null;
              },
            ),

            // Error message
            if (widget.error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF7F1D1D).withValues(alpha: 0.5), // red-900/50
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFFB91C1C), // red-700
                    width: 2,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error,
                      color: Color(0xFFFECACA), // red-200
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        widget.error!,
                        style: const TextStyle(
                          color: Color(0xFFFECACA), // red-200
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Reminder text
            Text(
              widget.l10n.betaWaitlistReminder,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.gray400,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              'https://pricofy.com/landing',
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.primary400,
                decoration: TextDecoration.underline,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            // Submit button
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primary500,
                    AppTheme.primary600,
                  ],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ElevatedButton(
                onPressed: widget.loading || _checkingEmail ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  widget.loading
                      ? widget.l10n.betaLoading
                      : _checkingEmail
                          ? widget.l10n.betaChecking
                          : _userExists
                              ? widget.l10n.betaCheckStatusButton
                              : widget.l10n.betaRegisterButton,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // No Instagram text
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.gray400,
                ),
                children: [
                  TextSpan(text: widget.l10n.betaNoInstagramText),
                  TextSpan(text: ' '),
                  TextSpan(
                    text: widget.l10n.betaContactLabel,
                    style: TextStyle(
                      color: AppTheme.primary400,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, {String? prefixText}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: AppTheme.gray400),
      prefixText: prefixText,
      prefixStyle: TextStyle(
        color: AppTheme.gray400,
        fontSize: 16,
        fontWeight: FontWeight.w500,
      ),
      filled: true,
      fillColor: const Color(0xFF1F2937), // gray-800
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const Color(0xFF374151)), // gray-700
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: const Color(0xFF374151)), // gray-700
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: AppTheme.primary500, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFEF4444)), // red-500
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    );
  }
}
