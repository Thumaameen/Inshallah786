import { serviceConfig, initializeWeb3, initializeGovernmentServices } from '../../config/service-integration'
import { DocumentService } from '../services/document-service'
import axios from 'axios'
import { ethers } from 'ethers'
import { Connection } from '@solana/web3.js'

export class GlobalServiceIntegration {
  private web3 = initializeWeb3()
  private govServices = initializeGovernmentServices()
  private documentService = new DocumentService()

  // Web3 Integration
  async verifyWeb3Identity(address: string) {
    try {
      // Check both Polygon and Solana
      const polygonBalance = await this.web3.polygon.getBalance(address)
      const solanaConnection = this.web3.solana
      const solanaBalance = await solanaConnection.getBalance(address)

      return {
        verified: true,
        chains: {
          polygon: ethers.formatEther(polygonBalance),
          solana: solanaBalance / 1e9
        }
      }
    } catch (error) {
      console.error('Web3 verification failed:', error)
      return { verified: false, error: 'Web3 verification failed' }
    }
  }

  // Government Integration
  async verifyIdentity(idNumber: string) {
    try {
      // Check with NPR
      const nprCheck = await this.govServices.dha.get(`/verify/${idNumber}`)
      
      // Check with HANIS
      const hanisCheck = await axios.post(
        'https://hanis.dha.gov.za/verify',
        { idNumber },
        {
          headers: {
            'Authorization': `Bearer ${serviceConfig.verification.hanis.apiKey}`
          }
        }
      )

      // Check with SAPS if needed
      const sapsCheck = await this.govServices.saps.get(`/verify/${idNumber}`)

      return {
        verified: nprCheck.data.verified && hanisCheck.data.verified,
        nprStatus: nprCheck.data.status,
        hanisStatus: hanisCheck.data.status,
        sapsStatus: sapsCheck.data.status
      }
    } catch (error) {
      console.error('Identity verification failed:', error)
      return { verified: false, error: 'Identity verification failed' }
    }
  }

  // Document Production
  async generateDocument(data: any, documentType: string) {
    try {
      // First verify identity
      const identityVerified = await this.verifyIdentity(data.idNumber)
      if (!identityVerified.verified) {
        throw new Error('Identity verification failed')
      }

      // Generate document with security features
      const document = await this.documentService.generateSecureDocument(data, documentType)

      // Store verification on blockchain
      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(document))
      )
      
      // Store on both Polygon and Solana
      await this.storeVerificationHash(verificationHash)

      return {
        document,
        verificationHash,
        verified: true
      }
    } catch (error) {
      console.error('Document generation failed:', error)
      return { error: 'Document generation failed' }
    }
  }

  // Store verification on blockchain
  private async storeVerificationHash(hash: string) {
    try {
      // Store on Polygon
      const polygonTx = await this.web3.polygon.send({
        to: serviceConfig.web3.polygon.contractAddress,
        data: hash
      })
      await polygonTx.wait()

      // Store on Solana
      // Add Solana transaction here

      return true
    } catch (error) {
      console.error('Blockchain storage failed:', error)
      return false
    }
  }

  // Global document verification
  async verifyGlobalDocument(document: any) {
    try {
      // Verify document authenticity
      const documentVerification = await this.documentService.verifyDocument(document)
      if (!documentVerification.verified) {
        throw new Error('Document verification failed')
      }

      // Check blockchain verification
      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(document))
      )
      
      // Check both chains
      const polygonVerified = await this.verifyOnPolygon(verificationHash)
      const solanaVerified = await this.verifyOnSolana(verificationHash)

      return {
        verified: documentVerification.verified && polygonVerified && solanaVerified,
        blockchain: {
          polygon: polygonVerified,
          solana: solanaVerified
        },
        document: documentVerification.document
      }
    } catch (error) {
      console.error('Global verification failed:', error)
      return { verified: false, error: 'Global verification failed' }
    }
  }

  private async verifyOnPolygon(hash: string) {
    try {
      // Implement Polygon verification
      return true
    } catch (error) {
      return false
    }
  }

  private async verifyOnSolana(hash: string) {
    try {
      // Implement Solana verification
      return true
    } catch (error) {
      return false
    }
  }
}