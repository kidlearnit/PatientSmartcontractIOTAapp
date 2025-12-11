"use client"

/**
 * ============================================================================
 * IOTA DAPP INTEGRATION COMPONENT
 * ============================================================================
 * 
 * This is the main integration component for your IOTA dApp.
 * 
 * All the contract logic is in hooks/useContract.ts
 * 
 * To customize your dApp, modify this file.
 * 
 * ============================================================================
 */

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useCurrentAccount } from "@iota/dapp-kit"
import { useContract } from "@/hooks/useContract"
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes"
import ClipLoader from "react-spinners/ClipLoader"

const SampleIntegration = () => {
  const currentAccount = useCurrentAccount()
  const { data, actions, state, objectId, isOwner, objectExists, hasValidData } = useContract()

  const [createForm, setCreateForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    diagnosis: "",
    medications: "",
    allergies: "",
    notes: "",
    doctor: "",
    visitTsMs: "",
    status: "",
  })

  const [updateForm, setUpdateForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    diagnosis: "",
    medications: "",
    allergies: "",
    notes: "",
    doctor: "",
    visitTsMs: "",
    status: "",
  })

  const [transferTo, setTransferTo] = useState("")
  
  const isConnected = !!currentAccount

  // Prefill update form when data loads
  useEffect(() => {
    if (data) {
      setUpdateForm({
        patientName: data.patientName,
        age: String(data.age),
        gender: data.gender,
        diagnosis: data.diagnosis,
        medications: data.medications,
        allergies: data.allergies,
        notes: data.notes,
        doctor: data.doctor,
        visitTsMs: String(data.visitTsMs),
        status: data.status,
      })
    }
  }, [data])

  const formattedDate = useMemo(() => {
    if (!data) return ""
    const d = new Date(data.lastUpdatedMs)
    return isNaN(d.getTime()) ? String(data.lastUpdatedMs) : d.toLocaleString()
  }, [data])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    const ageNum = parseInt(createForm.age, 10)
    const visitTs = parseInt(createForm.visitTsMs, 10)
    if (isNaN(ageNum)) return
    if (isNaN(visitTs)) return
    await actions.createRecord({
      patientName: createForm.patientName,
      age: ageNum,
      gender: createForm.gender,
      diagnosis: createForm.diagnosis,
      medications: createForm.medications,
      allergies: createForm.allergies,
      notes: createForm.notes,
      doctor: createForm.doctor,
      visitTsMs: visitTs,
      lastUpdatedMs: Date.now(),
      status: createForm.status,
    })
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!data) return
    const ageNum = parseInt(updateForm.age, 10)
    const visitTs = parseInt(updateForm.visitTsMs, 10)
    if (isNaN(ageNum)) return
    if (isNaN(visitTs)) return
    await actions.updateRecord({
      patientName: updateForm.patientName,
      age: ageNum,
      gender: updateForm.gender,
      diagnosis: updateForm.diagnosis,
      medications: updateForm.medications,
      allergies: updateForm.allergies,
      notes: updateForm.notes,
      doctor: updateForm.doctor,
      visitTsMs: visitTs,
      lastUpdatedMs: Date.now(),
      status: updateForm.status,
    })
  }

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault()
    if (!transferTo) return
    await actions.transferOwnership(transferTo)
    setTransferTo("")
  }

  if (!isConnected) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ maxWidth: "500px", width: "100%" }}>
          <Heading size="6" style={{ marginBottom: "1rem" }}>IOTA dApp</Heading>
          <Text>Please connect your wallet to interact with the contract.</Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", padding: "1rem", background: "var(--gray-a2)" }}>
      <Container style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Heading size="6" style={{ marginBottom: "2rem" }}>Hồ sơ bệnh án (IOTA Move)</Heading>

        {!objectId ? (
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
              <Text size="3" weight="medium">Tạo hồ sơ mới</Text>
              <input
                required
                placeholder="Họ tên"
                value={createForm.patientName}
                onChange={(e) => setCreateForm({ ...createForm, patientName: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                required
                placeholder="Giới tính"
                value={createForm.gender}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Tuổi"
                value={createForm.age}
                onChange={(e) => setCreateForm({ ...createForm, age: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                required
                placeholder="Chẩn đoán"
                value={createForm.diagnosis}
                onChange={(e) => setCreateForm({ ...createForm, diagnosis: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                placeholder="Dị ứng"
                value={createForm.allergies}
                onChange={(e) => setCreateForm({ ...createForm, allergies: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                placeholder="Thuốc"
                value={createForm.medications}
                onChange={(e) => setCreateForm({ ...createForm, medications: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                placeholder="Bác sĩ"
                value={createForm.doctor}
                onChange={(e) => setCreateForm({ ...createForm, doctor: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Thời gian khám (ms epoch)"
                value={createForm.visitTsMs}
                onChange={(e) => setCreateForm({ ...createForm, visitTsMs: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <input
                placeholder="Tình trạng (ví dụ: active/discharged)"
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
              />
              <textarea
                placeholder="Ghi chú"
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)", minHeight: 80 }}
              />
            </div>
            <Button
              size="3"
              type="submit"
              disabled={state.isPending}
            >
              {state.isPending ? (
                <>
                  <ClipLoader size={16} style={{ marginRight: "8px" }} />
                  Đang tạo...
                </>
              ) : (
                "Tạo hồ sơ"
              )}
            </Button>
            {state.error && (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--red-a3)", borderRadius: "8px" }}>
                <Text style={{ color: "var(--red-11)" }}>
                  Error: {(state.error as Error)?.message || String(state.error)}
                </Text>
              </div>
            )}
          </form>
        ) : (
          <div>
            {state.isLoading && !data ? (
              <Text>Loading object...</Text>
            ) : state.error ? (
              <div style={{ padding: "1rem", background: "var(--red-a3)", borderRadius: "8px" }}>
                <Text style={{ color: "var(--red-11)", display: "block", marginBottom: "0.5rem" }}>
                  Error loading object
                </Text>
                <Text size="2" style={{ color: "var(--red-11)" }}>
                  {state.error.message || "Object not found or invalid"}
                </Text>
                <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                  Object ID: {objectId}
                </Text>
                <Button
                  size="2"
                  variant="soft"
                  onClick={actions.clearObject}
                  style={{ marginTop: "1rem" }}
                >
                  Clear & Create New
                </Button>
              </div>
            ) : objectExists && !hasValidData ? (
              <div style={{ padding: "1rem", background: "var(--yellow-a3)", borderRadius: "8px" }}>
                <Text style={{ color: "var(--yellow-11)" }}>
                  Object found but data structure is invalid. Please check the contract structure.
                </Text>
                <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                  Object ID: {objectId}
                </Text>
              </div>
            ) : data ? (
              <div>
                <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--gray-a3)", borderRadius: "8px" }}>
                  <Text size="2" style={{ display: "block", marginBottom: "0.5rem" }}>Thông tin hồ sơ</Text>
                  <Heading size="7">{data.patientName}</Heading>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Tuổi: {data.age}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Giới tính: {data.gender || "—"}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Chẩn đoán: {data.diagnosis}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Thuốc: {data.medications || "—"}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Dị ứng: {data.allergies || "—"}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Bác sĩ: {data.doctor || "—"}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Thời gian khám: {data.visitTsMs}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Tình trạng: {data.status || "—"}</Text>
                  <Text size="2" style={{ display: "block", marginTop: "0.25rem" }}>Ghi chú: {data.notes || "—"}</Text>
                  <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                    Cập nhật: {formattedDate}
                  </Text>
                  <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.25rem", display: "block" }}>
                    Object ID: {objectId}
                  </Text>
                  <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.25rem", display: "block" }}>
                    Owner: {data.owner}
                  </Text>
                </div>

                {isOwner && (
                  <form onSubmit={handleUpdate} style={{ marginBottom: "1rem" }}>
                    <Text size="3" weight="medium" style={{ display: "block", marginBottom: "0.5rem" }}>Cập nhật hồ sơ</Text>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      <input
                        required
                        placeholder="Họ tên"
                        value={updateForm.patientName}
                        onChange={(e) => setUpdateForm({ ...updateForm, patientName: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        required
                        placeholder="Giới tính"
                        value={updateForm.gender}
                        onChange={(e) => setUpdateForm({ ...updateForm, gender: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        required
                        type="number"
                        min={0}
                        placeholder="Tuổi"
                        value={updateForm.age}
                        onChange={(e) => setUpdateForm({ ...updateForm, age: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        required
                        placeholder="Chẩn đoán"
                        value={updateForm.diagnosis}
                        onChange={(e) => setUpdateForm({ ...updateForm, diagnosis: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        placeholder="Dị ứng"
                        value={updateForm.allergies}
                        onChange={(e) => setUpdateForm({ ...updateForm, allergies: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        placeholder="Thuốc"
                        value={updateForm.medications}
                        onChange={(e) => setUpdateForm({ ...updateForm, medications: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        placeholder="Bác sĩ"
                        value={updateForm.doctor}
                        onChange={(e) => setUpdateForm({ ...updateForm, doctor: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        required
                        type="number"
                        min={0}
                        placeholder="Thời gian khám (ms epoch)"
                        value={updateForm.visitTsMs}
                        onChange={(e) => setUpdateForm({ ...updateForm, visitTsMs: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <input
                        placeholder="Tình trạng (ví dụ: active/discharged)"
                        value={updateForm.status}
                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)" }}
                      />
                      <textarea
                        placeholder="Ghi chú"
                        value={updateForm.notes}
                        onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                        style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)", minHeight: 80 }}
                      />
                    </div>
                    <Button
                      style={{ marginTop: "0.75rem" }}
                      type="submit"
                      disabled={state.isLoading || state.isPending}
                    >
                      {state.isLoading || state.isPending ? <ClipLoader size={16} /> : "Lưu cập nhật"}
                    </Button>
                  </form>
                )}

                {isOwner && (
                  <form onSubmit={handleTransfer} style={{ marginBottom: "1rem" }}>
                    <Text size="3" weight="medium" style={{ display: "block", marginBottom: "0.5rem" }}>Chuyển quyền sở hữu</Text>
                    <input
                      required
                      placeholder="Địa chỉ mới"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid var(--gray-a6)", width: "100%" }}
                    />
                    <Button
                      style={{ marginTop: "0.75rem" }}
                      type="submit"
                      disabled={state.isLoading || state.isPending}
                    >
                      {state.isLoading || state.isPending ? <ClipLoader size={16} /> : "Chuyển quyền"}
                    </Button>
                  </form>
                )}

                <Flex gap="2" style={{ marginBottom: "1rem" }}>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={actions.clearObject}
                  >
                    Xóa & tạo mới
                  </Button>
                </Flex>

                {state.hash && (
                  <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--gray-a3)", borderRadius: "8px" }}>
                    <Text size="1" style={{ display: "block", marginBottom: "0.5rem" }}>Transaction Hash</Text>
                    <Text size="2" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{state.hash}</Text>
                    {state.isConfirmed && (
                      <Text size="2" style={{ color: "green", marginTop: "0.5rem", display: "block" }}>
                        Transaction confirmed!
                      </Text>
                    )}
                  </div>
                )}

                {state.error && (
                  <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--red-a3)", borderRadius: "8px" }}>
                    <Text style={{ color: "var(--red-11)" }}>
                      Error: {(state.error as Error)?.message || String(state.error)}
                    </Text>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "1rem", background: "var(--yellow-a3)", borderRadius: "8px" }}>
                <Text style={{ color: "var(--yellow-11)" }}>Object not found</Text>
                <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                  Object ID: {objectId}
                </Text>
                <Button
                  size="2"
                  variant="soft"
                  onClick={actions.clearObject}
                  style={{ marginTop: "1rem" }}
                >
                  Clear & Create New
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}

export default SampleIntegration
