import { supabase } from "./database.js"

export const administrerGet = async (req, res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.redirect('error.html')
    }else{
       return res.view('template/administrer.ejs')
    }
}

export const AdmiconnectGet = async (req, res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.view('template/administration.ejs',{
            message_adm:`
            Connecter vous ici a l'administration pour continuer`
        })
    }else{
        return res.view('template/administration.ejs',{
            message_adm:`Vous etes actuellement 
            Connecter a l'administration`,
            admin:'admin'
        })
    }
}

export const administrationConsult = async (req, res)=>{
    const { data: admis, error: admisError } = await supabase
            .from('etudiants')
            .select('*')
            .eq('id',req.body.id)
            .single();
            if(admisError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
        return res.view('template/admin_cons.ejs',{
            data: [admis]
        })
        
}
export const AdmiRéinitialisationGet = async (req, res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.view('template/administration.ejs',{
            message_adm:"Vous n'etes pas connecter.Connecter vous ici a l'administration"
        })
    }else{
        return res.view('template/reinitPassAdm.ejs',{
            message_adm:"Réinitialiser le mot de pass de l'administration",
            admin:'admin'
        })
    }
}

export const EtuconnectGet = (req, res)=>{
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        return res.view('template/etu_connection.ejs',{
            message_etu:"Avez Vous avez déja un compte? Sinon inscrivez vous.Si oui connectez vous"
        })
    }else{
        return res.view('template/etu_connection.ejs',{
            message_etu:"Vous etes actuellement connecter. Appuyer sur voir mes notes pour continuer.",
            connecté: "connecté"
        })
    }
}

export const etuInscriptionGet = (req, res)=>{
    if(req.session_etu.get('user_etu') !== undefined && req.session_etu.get('user_etu') !== null){
        return res.view('template/etu_inscription.ejs',{
            message_etu:`Matricule:${req.session_etu.get('user_etu')?.id} est
            actuellement connecter.Déconnectez vous d'abord pour continuer.`
        })
    }else{
        return res.view('template/etu_inscription.ejs',{
            message_etu:"Inscrivez vous ici"
        })
    }
}

export const consulterNote = async (req, res)=>{
    if((req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null) &&
        (req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null)
    ){
        res.setCookie('consultation','consultation',{
            path:'/'
        })
        res.redirect('/')
    }
    if(!(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null)){
        const { data: admis, error: admisError } = await supabase
            .from('etudiants')
            .select('*')
            .eq('id',req.session_etu.get('user_etu')?.id)
            .single();
            if(admisError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
        if(admis.Note === null){
            return res.view('template/etu_note.ejs',{
                etudiant_note:'Votre Note n\'est pas encore disponible',
                etudiant_id: admis.id,
                etudiant_email: admis.email,
                message: 'Votre Note n\'est pas encore disponible'
            })
        }
        return res.view('template/etu_note.ejs',{
            etudiant_note:admis.Note,
            etudiant_id: admis.id,
            etudiant_email: admis.email
        })
    }
    if(!(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null)){
        const { data: admis, error: admisError } = await supabase
            .from('etudiants')
            .select('*')
            if(admisError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
        return res.view('template/admin_cons.ejs',{
            data: admis
        })
    }
}

export const deconnecterAdm = async (req,res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.redirect('/connectAdministration')
    }else{
        if(req.cookies.sessionConsent){
            res.clearCookie('sessionConsent',{
                Path:'/',
                secure:true,
                httpOnly:true,
                sameSite:'Strict'
            })
        }
        req.session_adm.delete()
        return res.redirect('index.html')
    }
}

export const deconnecterEtu = async (req,res)=>{
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        return res.redirect('/connectEtudiant')
    }else{
        if(req.cookies.sessionConsent){
            res.clearCookie('sessionConsent',{
                Path:'/',
                secure:true,
                httpOnly:true,
                sameSite:'Strict'
            })
        }
        req.session_etu.delete()
        return res.redirect('index.html')
    }
}
