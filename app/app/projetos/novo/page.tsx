"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabase"
export default function NovoProjeto(){

const [titulo,setTitulo] = useState("")
const [descricao,setDescricao] = useState("")
const [valor,setValor] = useState("")

async function publicar(){

const { error } = await supabase
.from("projetos")
.insert([
{
titulo,
descricao,
valor
}
])

if(error){
alert("Erro ao publicar projeto")
}else{
alert("Projeto publicado")
}

}

return(

<div style={{padding:"40px"}}>

<h1>Novo Projeto</h1>

<input
placeholder="Título"
value={titulo}
onChange={(e)=>setTitulo(e.target.value)}
/>

<br/><br/>

<textarea
placeholder="Descrição"
value={descricao}
onChange={(e)=>setDescricao(e.target.value)}
/>

<br/><br/>

<input
placeholder="Valor"
value={valor}
onChange={(e)=>setValor(e.target.value)}
/>

<br/><br/>

<button onClick={publicar}>
Publicar Projeto
</button>

</div>

)

}