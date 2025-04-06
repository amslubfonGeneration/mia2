import { supabase } from "./database.js"

export const administrerGet = async (req, res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.redirect('error.html')
    }else{   
        res.redirect('detail.html')
    }     
}

export const administrerS2_S3Get = async (req, res)=>{
    //...
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.redirect('error.html')
    }else{   
        if(req.session_adm.get('user_adm_info') === undefined || req.session_adm.get('user_adm_info') === null){
            res.redirect('detail.html')
        }else{
            return res.view('template/administrerS2_S3.ejs', {
                licence: req.session_adm.get('user_adm_info')?.Licence_,
                semestre: req.session_adm.get('user_adm_info')?.Semestre_
                //.......
            })
        }
    }
}

export const administrerS4Get = async (req, res)=>{
    //.......
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.redirect('error.html')
    }else{   
        if(req.session_adm.get('user_adm_info') === undefined || req.session_adm.get('user_adm_info') === null){
            res.redirect('detail.html')
        }else{
            return res.view('template/administrerS4.ejs', {
                licence: req.session_adm.get('user_adm_info')?.Licence_,
                semestre: req.session_adm.get('user_adm_info')?.Semestre_
                //.......
            })
        }
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
    const { data: admi, error: admisError } = await supabase
            .from('note')
            .select('*')
            
        const admis = admi.filter(item => item.id_etudiant === req.body.id)
        
            if(admisError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
        return res.view('template/admin_cons.ejs',{
            data: admis
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
        console.log(req.session_etu.get('user_etu'))
        res.setCookie('consultation','consultation',{
            path:'/'
        })
        res.redirect('/')
    }
    if(!(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null)){
        /*if(req.session_etu.get('user_etu_info') === undefined || req.session_etu.get('user_etu_info') === null){
            res.redirect('detail.html')
        }
        //.....*/
        const { data: admi, error: admiError } = await supabase
            .from('note')
            .select('*')
            if(admiError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
        const admis = admi.filter(item => item.id_etudiant === req.session_etu.get('user_etu')?.id)
            console.log(admis, req.session_etu.get('user_etu')?.id)
        
        return res.view('template/etu_note.ejs',{
            data: admis
        })

        
    
    }
    if(!(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null)){
        //.......
        const { data: admis, error: admisError } = await supabase
            .from('note')
            .select('*')
            if(admisError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
            console.log(admis)
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
