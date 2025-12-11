// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

/// A minimal medical record stored as a shared object so it can be read by
/// anyone, while only the owner (creator) can update it.
module patient::contract {
  use std::string;


  /// Shared medical record with common fields for a patient visit.
  public struct MedicalRecord has key {
    id: UID,
    owner: address,
    patient_name: string::String,
    age: u8,
    gender: string::String,
    diagnosis: string::String,
    medications: string::String,
    allergies: string::String,
    notes: string::String,
    doctor: string::String,
    visit_ts_ms: u64,
    last_updated_ms: u64,
    status: string::String,
  }

  /// Create and share a medical record. The creator becomes the owner.
  /// `last_updated_ms` is a caller-provided timestamp (e.g. from the client)
  /// to avoid a clock dependency in the module.
  public fun create(
    patient_name: string::String,
    age: u8,
    gender: string::String,
    diagnosis: string::String,
    medications: string::String,
    allergies: string::String,
    notes: string::String,
    doctor: string::String,
    visit_ts_ms: u64,
    last_updated_ms: u64,
    status: string::String,
    ctx: &mut TxContext
  ) {
    transfer::share_object(MedicalRecord {
      id: object::new(ctx),
      owner: ctx.sender(),
      patient_name,
      age,
      gender,
      diagnosis,
      medications,
      allergies,
      notes,
      doctor,
      visit_ts_ms,
      last_updated_ms,
      status,
    })
  }

  /// Update the record (only the owner can call this).
  public fun update(
    record: &mut MedicalRecord,
    patient_name: string::String,
    age: u8,
    gender: string::String,
    diagnosis: string::String,
    medications: string::String,
    allergies: string::String,
    notes: string::String,
    doctor: string::String,
    visit_ts_ms: u64,
    last_updated_ms: u64,
    status: string::String,
    ctx: &TxContext
  ) {
    assert!(record.owner == ctx.sender(), 0);

    record.patient_name = patient_name;
    record.age = age;
    record.gender = gender;
    record.diagnosis = diagnosis;
    record.medications = medications;
    record.allergies = allergies;
    record.notes = notes;
    record.doctor = doctor;
    record.visit_ts_ms = visit_ts_ms;
    record.last_updated_ms = last_updated_ms;
    record.status = status;
  }

  /// Transfer ownership to another address (e.g. transferring custody).
  public fun transfer_ownership(
    record: &mut MedicalRecord,
    new_owner: address,
    ctx: &TxContext
  ) {
    assert!(record.owner == ctx.sender(), 0);
    record.owner = new_owner;
  }
}

