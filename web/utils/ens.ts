import { normalize } from 'viem/ens'
import { publicClient } from './client'
 

export const getEnsAddress = async (name: string) => {
  const ensAddress = await publicClient.getEnsAddress({
    name: normalize(name),
  })
  return ensAddress
}

export const getEnsText = async (name: string, key: string) => {
  const ensText = await publicClient.getEnsText({
    name: normalize(name),
    key,
  })
  return ensText
}


export const getEnsAvatar = async (name: string) => {
  const ensAvatar = await publicClient.getEnsAvatar({
    name: normalize(name),
  })
  return ensAvatar
}

export const getEnsName = async (address: `0x${string}`) => {
  const ensName = await publicClient.getEnsName({
    address: address,
  })
  return ensName
}

export const getEnsResolver = async (name: string) => {
  const ensResolver = await publicClient.getEnsResolver({
    name: normalize(name),
  })
  return ensResolver
}


export const getAllEnsRecords = async (name: string) => {
  const textRecords = [
    "email",
    "url",
    "avatar",
    "description",
    "com.twitter",
    "com.github",
    "com.discord",
    "org.telegram",
    "com.reddit",
    "com.instagram",
    "com.linkedin",
    "com.twitch",
    "com.tiktok",
    "com.creditscore",
    "com.bank",
    "com.netflix"
  ]
  
  const ensRecords = await Promise.all(
    textRecords.map(async (record) => {
      const ensRecord = await publicClient.getEnsText({
        name: normalize(name),
        key: record,
      })
      return { key: record, value: ensRecord }
    })
  )
  
  // Filter out null/undefined values and return only records with actual values
  const data = ensRecords.filter(record => record.value != null && record.value !== "")
  console.log(data)
  return data
}