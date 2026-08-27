# [0007] - Przeterminowana data dopytania widoczna także na karcie

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
FollowUpDate jest opcjonalna dla akcji WaitingOn; po terminie znacznik przeterminowania (bez powiadomień). Pytanie: tylko przy akcji czy też zagregowanie widoczne?

## Decision
Dwupoziomowo: czerwony znacznik przy samej akcji w panelu + subtelna plakietka agregowana na karcie wątku po lewej (np. „1 po terminie”), by overflow było widać bez otwierania wątku. Akcje `done` nie straszą przeterminowaniem.

## Impact
ACTIONS.md (Edit Action note). Karta wątku dostaje nowy atrybut pochodny (licznik undone-po-terminie).
