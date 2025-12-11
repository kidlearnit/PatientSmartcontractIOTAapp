"use client"

/**
 * ============================================================================
 * IOTA CONTRACT INTEGRATION HOOK
 * ============================================================================
 * 
 * This hook contains ALL the contract interaction logic.
 * 
 * To customize your dApp, modify the configuration section below.
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react"
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
  useIotaClientQuery,
} from "@iota/dapp-kit"
import { Transaction } from "@iota/iota-sdk/transactions"
import { useNetworkVariable } from "@/lib/config"
import type { IotaObjectData } from "@iota/iota-sdk/client"

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================
// Change these values to match your Move contract

export const CONTRACT_MODULE = "contract" // Your Move module name
export const DEFAULT_PACKAGE_ID = "0x3cf556d1ccc736fcbe5e542c82c1db382c3e38ec6eb05443836850eeae6c768e"
export const CONTRACT_METHODS = {
  CREATE: "create",
  UPDATE: "update",
  TRANSFER_OWNERSHIP: "transfer_ownership",
} as const

// ============================================================================
// DATA EXTRACTION
// ============================================================================
// Modify this to extract data from your contract's object structure

type ParsedRecord = {
  owner: string
  patientName: string
  age: number
  gender: string
  diagnosis: string
  medications: string
  allergies: string
  notes: string
  doctor: string
  visitTsMs: number
  lastUpdatedMs: number
  status: string
}

function getObjectFields(data: IotaObjectData): ParsedRecord | null {
  if (data.content?.dataType !== "moveObject") {
    console.log("Data is not a moveObject:", data.content?.dataType)
    return null
  }
  
  const fields = data.content.fields as any
  if (!fields) {
    console.log("No fields found in object data")
    return null
  }
  
  // Log the actual structure for debugging
  console.log("Object fields structure:", JSON.stringify(fields, null, 2))
  
  const asString = (val: unknown) => (typeof val === "string" ? val : val ? String(val) : "")
  const owner = asString(fields.owner)
  const patientName = asString(fields.patient_name)
  const gender = asString(fields.gender)
  const diagnosis = asString(fields.diagnosis)
  const medications = asString(fields.medications)
  const allergies = asString(fields.allergies)
  const notes = asString(fields.notes)
  const doctor = asString(fields.doctor)
  const status = asString(fields.status)

  const parseNum = (val: unknown) => {
    if (typeof val === "number") return val
    if (typeof val === "string") return parseInt(val, 10)
    return NaN
  }

  const age = parseNum(fields.age)
  const visitTsMs = parseNum(fields.visit_ts_ms)
  const lastUpdatedMs = parseNum(fields.last_updated_ms)

  if (!owner || isNaN(age) || isNaN(visitTsMs) || isNaN(lastUpdatedMs)) {
    console.log("Invalid record fields", { owner, age, visitTsMs, lastUpdatedMs })
    return null
  }

  return {
    owner,
    patientName,
    age,
    gender,
    diagnosis,
    medications,
    allergies,
    notes,
    doctor,
    visitTsMs,
    lastUpdatedMs,
    status,
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface ContractData {
  patientName: string
  age: number
  gender: string
  diagnosis: string
  medications: string
  allergies: string
  notes: string
  doctor: string
  visitTsMs: number
  lastUpdatedMs: number
  status: string
  owner: string
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: string | undefined
  error: Error | null
}

export interface ContractActions {
  createRecord: (input: CreateRecordInput) => Promise<void>
  updateRecord: (input: UpdateRecordInput) => Promise<void>
  transferOwnership: (newOwner: string) => Promise<void>
  clearObject: () => void
}

export type CreateRecordInput = {
  patientName: string
  age: number
  gender: string
  diagnosis: string
  medications: string
  allergies: string
  notes: string
  doctor: string
  visitTsMs: number
  lastUpdatedMs: number
  status: string
}

export type UpdateRecordInput = CreateRecordInput

export const useContract = () => {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const packageId = useNetworkVariable("packageId") ?? DEFAULT_PACKAGE_ID
  const iotaClient = useIotaClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [objectId, setObjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [transactionError, setTransactionError] = useState<Error | null>(null)

  // Load object ID from URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1)
      if (hash) setObjectId(hash)
    }
  }, [])

  // Fetch object data
  const { data, isPending: isFetching, error: queryError, refetch } = useIotaClientQuery(
    "getObject",
    {
      id: objectId!,
      options: { showContent: true, showOwner: true },
    },
    {
      enabled: !!objectId,
    }
  )

  // Extract fields
  const fields = data?.data ? getObjectFields(data.data) : null
  const isOwner = fields?.owner.toLowerCase() === address?.toLowerCase()
  
  // Check if object exists but data extraction failed
  const objectExists = !!data?.data
  const hasValidData = !!fields

  // Create record
  const createRecord = async (input: CreateRecordInput) => {
    if (!packageId) return

    try {
      setIsLoading(true)
      setTransactionError(null)
      setHash(undefined)
      const tx: any = new Transaction()
      tx.moveCall({
        arguments: [
          tx.pure.string(input.patientName),
          tx.pure.u8(input.age),
          tx.pure.string(input.gender),
          tx.pure.string(input.diagnosis),
          tx.pure.string(input.medications),
          tx.pure.string(input.allergies),
          tx.pure.string(input.notes),
          tx.pure.string(input.doctor),
          tx.pure.u64(input.visitTsMs),
          tx.pure.u64(input.lastUpdatedMs),
          tx.pure.string(input.status),
        ],
        target: `${packageId}::${CONTRACT_MODULE}::${CONTRACT_METHODS.CREATE}`,
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              })
              const newObjectId = effects?.created?.[0]?.reference?.objectId
              if (newObjectId) {
                setObjectId(newObjectId)
                if (typeof window !== "undefined") {
                  window.location.hash = newObjectId
                }
                // Reset loading - the query will handle its own loading state
                setIsLoading(false)
              } else {
                setIsLoading(false)
                console.warn("No object ID found in transaction effects")
              }
            } catch (waitError) {
              console.error("Error waiting for transaction:", waitError)
              setIsLoading(false)
            }
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("Error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error creating object:", err)
      setIsLoading(false)
    }
  }

  // Update record
  const updateRecord = async (input: UpdateRecordInput) => {
    if (!objectId || !packageId) return

    try {
      setIsLoading(true)
      setTransactionError(null)
      const tx: any = new Transaction()
      tx.moveCall({
        arguments: [
          tx.object(objectId),
          tx.pure.string(input.patientName),
          tx.pure.u8(input.age),
          tx.pure.string(input.gender),
          tx.pure.string(input.diagnosis),
          tx.pure.string(input.medications),
          tx.pure.string(input.allergies),
          tx.pure.string(input.notes),
          tx.pure.string(input.doctor),
          tx.pure.u64(input.visitTsMs),
          tx.pure.u64(input.lastUpdatedMs),
          tx.pure.string(input.status),
        ],
        target: `${packageId}::${CONTRACT_MODULE}::${CONTRACT_METHODS.UPDATE}`,
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
            await iotaClient.waitForTransaction({ digest })
            await refetch()
            setIsLoading(false)
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("Error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error updating:", err)
      setIsLoading(false)
    }
  }

  // Transfer ownership
  const transferOwnership = async (newOwner: string) => {
    if (!objectId || !packageId) return

    try {
      setIsLoading(true)
      setTransactionError(null)
      const tx: any = new Transaction()
      tx.moveCall({
        arguments: [tx.object(objectId), tx.pure.address(newOwner)],
        target: `${packageId}::${CONTRACT_MODULE}::${CONTRACT_METHODS.TRANSFER_OWNERSHIP}`,
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
            await iotaClient.waitForTransaction({ digest })
            await refetch()
            setIsLoading(false)
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("Error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("Error transferring ownership:", err)
      setIsLoading(false)
    }
  }

  const contractData: ContractData | null = fields
    ? {
        patientName: fields.patientName,
        age: fields.age,
        gender: fields.gender,
        diagnosis: fields.diagnosis,
        medications: fields.medications,
        allergies: fields.allergies,
        notes: fields.notes,
        doctor: fields.doctor,
        visitTsMs: fields.visitTsMs,
        lastUpdatedMs: fields.lastUpdatedMs,
        status: fields.status,
        owner: fields.owner,
      }
    : null

  const clearObject = () => {
    setObjectId(null)
    setTransactionError(null)
    if (typeof window !== "undefined") {
      window.location.hash = ""
    }
  }

  const actions: ContractActions = {
    createRecord,
    updateRecord,
    transferOwnership,
    clearObject,
  }

  const contractState: ContractState = {
    isLoading: (isLoading && !objectId) || isPending || isFetching,
    isPending,
    isConfirming: false,
    isConfirmed: !!hash && !isLoading && !isPending,
    hash,
    error: queryError || transactionError,
  }

  return {
    data: contractData,
    actions,
    state: contractState,
    objectId,
    isOwner,
    objectExists,
    hasValidData,
  }
}

