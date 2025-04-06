import {verify, hash} from '@phc/argon2'
import { supabase } from './database.js';
import { transporte } from './email.js';
import { email_user } from './config.js';


export const Information =  async(req, res)=>{
    const info = [
        {Licence_: 'Licence1',Semestre_: 'Semestre2'},
        {Licence_: 'Licence2',Semestre_: 'Semestre3'},
        {Licence_: 'Licence2',Semestre_: 'Semestre4'}
    ]
    if(info.some(item => item.Licence_=== req.body.Licence_ && item.Semestre_ === req.body.Semestre_)){
        if((req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null)&&
            (req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null)){
            res.setCookie('consultation','consultation',{
                path:'/'
            })
            res.redirect('/')
        }else{
            if(!(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null)){
                req.session_etu.set('user_etu_info', req.body)
                res.redirect('/consulter')
            }
            if(!(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null)){
                req.session_adm.set('user_adm_info', req.body)
                if(JSON.stringify(req.body) === JSON.stringify(info[0]) || 
                    JSON.stringify(req.body) === JSON.stringify(info[1])){
                    res.redirect('/administrerS2_S3')
                }
                if(JSON.stringify(req.body) === JSON.stringify(info[2])){
                    res.redirect('/administrerS4')
                }
            }
        }
    }else{
        res.setCookie('Information',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
        })
        res.redirect('detail.html')
    }
}

export const etuInscriptionPost = async (req, res)=>{
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        const password = await hash(req.body.password)
        const { data: admis, error: admisError } = await supabase
                .from('etudiants')
                .select('*')
                .eq('id',req.body.id)
                .single();
                if(admisError){
                    throw new Error("Une erreur s'est produite Réesayer")
                }
        if(admis.password === null){
               try {
                // Envoyer un e-mail a l'administration
                await transporte.sendMail({
                    from: `"Inscription MiaTpNote" <${email_user}>`,
                    to: req.body.email,
                    subject: 'Contact support miaTpNote', // Sujet de l'e-mail
                        text: `Garder ses informations pour vos futures connexions en cas d'oublie de vos identifiants\nMatricule: ${req.body.id}\nContact/Email: ${req.body.email}\nMots de pass: ${req.body.password}`, // Contenu en texte brut
                        html: `<p><strong>Matricule:</strong> ${req.body.id}</p>
                            <p><strong>Nouveau Mot de pass:</strong> ${req.body.password}</p>`
                })
        }catch (error) {
            //console.error(error);
            if(error.message === 'Connection timeout'){
                throw new Error("Une erreur s'est produite Réesayer")
            }
            res.redirect('error.html')
        }
            const { error: insertError } = await supabase
                    .from('etudiants')
                    .update({'password':password, 'email':req.body.email})
                    .eq('id', req.body.id)
            if(insertError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
            res.setCookie('inscription','inscription réussit',{
                Path:'/',
                secure:true,
                httpOnly:true,
                sameSite:'Strict'
            })
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            return res.redirect('/')
        }else{
            return res.view('template/etu_inscription.ejs',{
                message_etu:`Matricule:${req.body.id} a déja un compte.`
            })
        }
    }else{
        return res.view('template/etu_inscription',{
            message_etu: `Matricule:${req.session_etu.get('user_etu')?.id},
            déconnecté vous d'abord pour effectuer cette action`
        })
    }
}

export const EtuconnectPost = async (req, res)=>{
    if(req.cookies.sessionDeConsent){
        res.clearCookie('sessionDeConsent',{
            Path:'/',
            secure:true,
            httpOnly:true,
            sameSite:'Strict'
        })
        return res.redirect('connectEtudiant')
    }
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        const id = req.body.id
        const { data: admis, error: admisError } = await supabase
                .from('etudiants')
                .select('*')
                .eq('id',id)
                .single();
        if(admisError){
            throw new Error("Une erreur s'est produite Réesayer")
        }
        if(
                admis !== undefined && 
                await verify(admis.password, req.body.password)
        ){
            req.session_etu.set('user_etu', {
                    id: admis.id
            })
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            res.redirect('/')
        }else{
            return res.view('template/etu_connection',{
                message_etu: "Echec de Connexion.Vérifier vos identifiants et réesssayer"
            })
        }
    }else{
        return res.view('template/etu_connection',{
            message_etu: `Matricule:${req.session_etu.get('user_etu')?.id},
            déconnecté vous d'abord pour cette action`
        })
    }
}

/*export const reinitPassEtu = async (req, res)=>{
   const { error: deleteError } = await supabase
            .from('etudiants')
            .update({'password':await hash(req.body.password)})
            .eq('id', req.body.id)
            if(deleteError){
                return res.view('template/etu_connection',{
                    message: `Matricule:${req.body.id} n'existe`
                })
            }  
            res.setCookie('reinit','Réinitialisation réussit',{
                path:'/',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            })
            if(req.cookies.sessionConsent){
                res.clearCookie('sessionConsent',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
        return res.redirect('/') 
}*/
