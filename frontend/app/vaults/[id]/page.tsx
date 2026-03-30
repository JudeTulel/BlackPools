import React from 'react'
import { VaultCardProps } from '@/type'

const VaultDetails = async ({network , token, name, curator, liquidity, apy, slug}: VaultCardProps) => {
    
  return (
    <section id='event'>
<h1>Vault Details for  #{name}</h1>
<span className='details'></span>
<div className='content'>
  <img src="" alt="" className='banner'/>
</div>

    </section>
    
  )
}

export default VaultDetails