"use client"

import { useRouter } from "next/navigation"

export default function PainelContratante(){

const router = useRouter()

function criarProjeto(){
router.push("/projetos/novo")
}

return(

<div style={{padding:"40px"}}>

<h1>Painel do Contratante</h1>

<p>Bem vindo ao FreelaBrasil.</p>

<button onClick={criarProjeto}>
Criar novo projeto
</button>

</div>

)

}