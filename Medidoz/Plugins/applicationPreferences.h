//
//  applicationPreferences.h
//
//
//  Created by Tue Topholm on 31/01/11.
//  Copyright 2011 Sugee. All rights reserved.
//

#import <Foundation/Foundation.h>
#ifdef CORDOVA_FRAMEWORK
#import <Cordova/CDVPlugin.h>
#else
#import "Cordova/CDVPlugin.h"
#endif

@interface applicationPreferences : CDVPlugin
{
    
}

-	(void) getSetting:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-	(void) setSetting:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-	(NSString*) getSettingFromBundle:(NSString*)settingName;


@end