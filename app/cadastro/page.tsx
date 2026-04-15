"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Cadastro() {

const [nome,setNome] = useState("")
const [email,setEmail] = useState("")
const [senha,setSenha] = useState("")
const [tipo,setTipo] = useState("freelancer")

async function cadastrarUsuario(){

const {data,error} = await supabase
.from("usuarios")
.insert([
{
nome:nome,
email:email,
senha:senha,
tipo_usuario:tipo
}
])

if (error) {
  console.log("ERRO SUPABASE:", error);
  alert(`Erro ao cadastrar: ${error.message}`);
} else {
  alert("Cadastro realizado com sucesso");
}

}

return(

<main style={{padding:40}}>

<h1>Cadastro FreelaBrasil</h1>

<input
placeholder="Nome"
value={nome}
onChange={(e)=>setNome(e.target.value)}
/>

<br/>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<br/>

<input
placeholder="Senha"
type="password"
value={senha}
onChange={(e)=>setSenha(e.target.value)}
/>

<br/>

<select
value={tipo}
onChange={(e)=>setTipo(e.target.value)}
>

<option value="freelancer">
Freelancer
</option>

<option value="contratante">
Contratante
</option>

</select>

<br/>

<button onClick={cadastrarUsuario}>
Criar conta
</button>

</main>

)

}