import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

export const useBalance = () => {

  // Web3React provides all current state info in this context
  // we're being verbose so it's clear that useWeb3React relies on useContext
  // so this is global and can be used anywhere
  const context = useWeb3React()
  const { library, chainId, account } = context

  const [balance, setBalance] = useState()

  useEffect(() => {
    if (!!account && !!library) {
      let stale = false

      library
        .getBalance(account)
        .then((balance) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return balance
}
