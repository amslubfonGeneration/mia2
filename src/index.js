import fastifyFormbody from "@fastify/formbody"
import secureSession from "@fastify/secure-session"
import fastifyStatic from "@fastify/static"
import fastifyView from "@fastify/view"
import fastify from "fastify"
import ejs from 'ejs'
import fs from 'node:fs'
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { AdmiconnectGet,administrerGet,AdmiRéinitialisationGet,consulterNote,deconnecterAdm,deconnecterEtu,EtuconnectGet,etuInscriptionGet} from './getaction.js'
import { AdmiconnectPost, administrerPost, AdmiRéinitialisationPost, EtuconnectPost, etuInscriptionPost} from './postaction.js'
import { traitementMailPost } from "./email.js"
import { session_key1, session_key2 } from "./config.js"
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const app = fastify({logger:true})
app.register(fastifyView,{
    engine: {
        ejs
    }
})
app.register(fastifyStatic, {
    root:join(rootDir,'public')
})
app.register(fastifyFormbody)
app.register(secureSession,[{
    sessionName: 'session_adm',
    cookieName: 'session_adm_cookies',
    key: session_key1,
    cookie: {
        path:'/',
        httpOnly:true,
        sameSite:true
    }},{
    sessionName: 'session_etu',
    cookieName: 'session_etu_cookies',
    key: session_key2,
    cookie: {
        path:'/',
        httpOnly:true,
        sameSite: true
    }}
])
app.get('/Réinitialisation', AdmiRéinitialisationGet)
app.get('/connectAdministration', AdmiconnectGet)
app.get('/connectEtudiant', EtuconnectGet)
app.get('/etuInscription', etuInscriptionGet)
app.get('/administrer',administrerGet)
app.get('/deconnectAdm', deconnecterAdm)
app.get('/deconnectEtu', deconnecterEtu)
app.get('/emailaction',async (req, res)=>{
    return res.view('template/email.ejs')
})
app.get('/',async (req, res)=>{
    return res.redirect('index.html')
})
app.get('/api/users',async(req, res)=>{
    if(req.session_etu.get('user_etu')?.id || req.session_adm.get('user_adm')?.id){
        res.send({
            isUser: true,
            isUserId:req.session_etu.get('user_etu')?.id || 'Administration',
            inscription:req.cookies.inscription,
            reinit: req.cookies.reinit
        })
    }else{
        res.send({
            isUser: false,
            inscription:req.cookies.inscription,
            reinit: req.cookies.reinit
        })
    }
})
app.get('/consulter', consulterNote)
app.get('/health', async(req, res)=>{
    res.status(200).send('OK');
})
//Methode post
app.post('/Réinitialisation', AdmiRéinitialisationPost)
app.post('/connectEtudiant', EtuconnectPost)
app.post('/connectAdministration', AdmiconnectPost)
app.post('/etuInscription', etuInscriptionPost)
app.post('/administrer', administrerPost)
app.post('/emailaction', traitementMailPost)
//Getion des erreurs de l'Api

app.setErrorHandler((error,req,res) => {
    if(error.message === "Cannot read properties of null (reading 'password')"){
        return res.view('template/administration.ejs', {
            message: "Erreur de connexion a l'administration. Vérifier votre connexion internet"
        })
    }
    if(error.message === "Une erreur s'est produite Réesayer"){
        return res.redirect("error.html")
    }   
    if(error.message === "pchstr must be a non-empty string"){
        return res.redirect("error.html")
    } 
    console.error(error)
    res.statusCode = 500
    return {
        error: error.message  
    }
})
app.listen({host: host, port: 8000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})

