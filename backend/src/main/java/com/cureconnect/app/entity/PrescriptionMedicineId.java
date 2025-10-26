package com.cureconnect.app.entity;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PrescriptionMedicineId implements Serializable {

    @Column(name = "prescription_id")
    private UUID prescriptionId;

    @Column(name = "medicine_id")
    private UUID medicineId;
}